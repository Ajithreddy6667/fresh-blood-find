import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyDonorRequest {
  donor_id: string;
  blood_type: string;
  urgency: string;
  message?: string;
}

// Format phone number to E.164 format for Twilio
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // If it starts with 0, assume it's an Indian number and replace with 91
  if (cleaned.startsWith("0")) {
    cleaned = "91" + cleaned.substring(1);
  }
  
  // If it's a 10-digit number, assume it's Indian and add 91
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  
  // If it doesn't start with +, add it
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  
  return cleaned;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Notify Donor Function Started ===");
    
    // 1. Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    console.log("Twilio configured:", !!twilioAccountSid && !!twilioAuthToken && !!twilioPhoneNumber);
    console.log("Resend configured:", !!resendApiKey);

    // 2. Create client with user's JWT to verify authentication
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // 3. Verify JWT and get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    // 4. Fetch requester info from authenticated user's profile (don't trust client data)
    const { data: requesterProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    if (profileError || !requesterProfile) {
      console.error("Profile not found:", profileError?.message);
      return new Response(
        JSON.stringify({ error: "Profile not found. Please complete your profile first." }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use verified data from database, not client-supplied
    const requester_name = requesterProfile.full_name || "A RedConnect user";
    const requester_phone = requesterProfile.phone || "Not provided";

    console.log("Requester:", requester_name, "Phone:", requester_phone);

    // 5. Parse request body (only accept donor_id, blood_type, urgency, message from client)
    const { donor_id, blood_type, urgency, message } = await req.json() as NotifyDonorRequest;

    if (!donor_id) {
      return new Response(
        JSON.stringify({ error: "donor_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Notification request for donor:", donor_id);

    // 6. Use service role client for privileged operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get donor info using the RPC function
    const { data: donorData, error: donorError } = await supabase
      .rpc("get_donor_contact_info", { p_donor_id: donor_id });

    if (donorError || !donorData || donorData.length === 0) {
      console.error("Failed to get donor info:", donorError);
      return new Response(
        JSON.stringify({ error: "Donor not found or unavailable" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const donor = donorData[0];
    console.log("Found donor:", donor.full_name, "Phone:", donor.phone);

    // Get donor's user_id from donors table
    const { data: donorRecord, error: donorRecordError } = await supabase
      .from("donors")
      .select("user_id")
      .eq("id", donor_id)
      .single();

    if (donorRecordError || !donorRecord) {
      console.error("Failed to get donor user_id:", donorRecordError);
      return new Response(
        JSON.stringify({ error: "Donor record not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prevent users from notifying themselves
    if (donorRecord.user_id === user.id) {
      return new Response(
        JSON.stringify({ error: "You cannot send a notification to yourself" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get donor's email from profiles
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", donorRecord.user_id)
      .single();

    const notificationMessage = `${requester_name} is urgently requesting ${blood_type} blood. Urgency: ${urgency}. Contact: ${requester_phone}${message ? `. Message: ${message}` : ""}`;

    const results = {
      inApp: false,
      sms: false,
      whatsapp: false,
      email: false,
      errors: [] as string[],
    };

    // 1. Create in-app notification
    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: donorRecord.user_id,
        title: `Blood Request for ${blood_type}`,
        message: notificationMessage,
        type: "blood_request",
        metadata: {
          requester_id: user.id,
          requester_name,
          requester_phone,
          blood_type,
          urgency,
        },
      });

    if (!notifError) {
      results.inApp = true;
      console.log("In-app notification created successfully");
    } else {
      console.error("Failed to create in-app notification:", notifError);
      results.errors.push("In-app notification failed");
    }

    // 2. Send SMS via Twilio
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && donor.phone) {
      const formattedPhone = formatPhoneNumber(donor.phone);
      console.log("Sending SMS to:", formattedPhone, "(original:", donor.phone, ")");
      
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append("To", formattedPhone);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", `🩸 RedConnect Alert: ${notificationMessage}`);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const twilioResult = await twilioResponse.text();
        console.log("Twilio SMS response status:", twilioResponse.status);
        console.log("Twilio SMS response:", twilioResult);

        if (twilioResponse.ok) {
          results.sms = true;
          console.log("SMS sent successfully");
        } else {
          console.error("Twilio SMS error:", twilioResult);
          results.errors.push(`SMS failed: ${twilioResult}`);
        }
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        results.errors.push(`SMS exception: ${smsError}`);
      }

      // 3. Try WhatsApp via Twilio (if SMS works, WhatsApp might too)
      try {
        const whatsappUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const whatsappData = new URLSearchParams();
        whatsappData.append("To", `whatsapp:${formattedPhone}`);
        whatsappData.append("From", `whatsapp:${twilioPhoneNumber}`);
        whatsappData.append("Body", `🩸 *RedConnect Blood Request Alert*\n\n${requester_name} urgently needs *${blood_type}* blood.\n\n📞 Contact: ${requester_phone}\n⚡ Urgency: ${urgency}${message ? `\n💬 Message: ${message}` : ""}\n\nPlease contact them if you can help!`);

        const whatsappResponse = await fetch(whatsappUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: whatsappData.toString(),
        });

        const whatsappResult = await whatsappResponse.text();
        console.log("Twilio WhatsApp response status:", whatsappResponse.status);
        console.log("Twilio WhatsApp response:", whatsappResult);

        if (whatsappResponse.ok) {
          results.whatsapp = true;
          console.log("WhatsApp message sent successfully");
        } else {
          console.log("WhatsApp not configured or failed:", whatsappResult);
        }
      } catch (whatsappError) {
        console.log("WhatsApp sending not available:", whatsappError);
      }
    } else {
      const missing = [];
      if (!twilioAccountSid) missing.push("TWILIO_ACCOUNT_SID");
      if (!twilioAuthToken) missing.push("TWILIO_AUTH_TOKEN");
      if (!twilioPhoneNumber) missing.push("TWILIO_PHONE_NUMBER");
      if (!donor.phone) missing.push("donor phone");
      console.log("SMS/WhatsApp not sent. Missing:", missing.join(", "));
      results.errors.push(`SMS not configured: missing ${missing.join(", ")}`);
    }

    // 4. Send Email via Resend
    if (resendApiKey && profile?.email) {
      try {
        console.log("Sending email to:", profile.email);
        const resend = new Resend(resendApiKey);
        const emailResponse = await resend.emails.send({
          from: "RedConnect <onboarding@resend.dev>",
          to: [profile.email],
          subject: `Urgent Blood Request for ${blood_type}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #DC2626;">🩸 Blood Request Alert</h1>
              <p>Hello ${donor.full_name},</p>
              <p>Someone needs your help! A blood request has been made that matches your blood type.</p>
              <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #DC2626;">Request Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Requester:</strong> ${requester_name}</li>
                  <li><strong>Blood Type Needed:</strong> ${blood_type}</li>
                  <li><strong>Urgency:</strong> ${urgency}</li>
                  <li><strong>Contact:</strong> ${requester_phone}</li>
                  ${message ? `<li><strong>Message:</strong> ${message}</li>` : ""}
                </ul>
              </div>
              <p>If you're available to donate, please contact the requester directly at <a href="tel:${requester_phone}">${requester_phone}</a>.</p>
              <p style="color: #666; font-size: 14px;">Thank you for being a donor with RedConnect!</p>
            </div>
          `,
        });

        console.log("Resend email response:", JSON.stringify(emailResponse));

        if (emailResponse.data?.id) {
          results.email = true;
          console.log("Email sent successfully");
        } else {
          console.error("Email failed:", emailResponse.error);
          results.errors.push(`Email failed: ${emailResponse.error?.message}`);
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        results.errors.push(`Email exception: ${emailError}`);
      }
    } else {
      console.log("Email not configured or donor has no email");
      if (!resendApiKey) results.errors.push("RESEND_API_KEY not configured");
      if (!profile?.email) results.errors.push("Donor email not found");
    }

    console.log("=== Notification Results ===", JSON.stringify(results));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification sent",
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-donor function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

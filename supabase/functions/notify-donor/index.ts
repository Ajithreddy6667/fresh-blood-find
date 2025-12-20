import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyDonorRequest {
  donor_id: string;
  requester_name: string;
  requester_phone: string;
  blood_type: string;
  urgency: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { donor_id, requester_name, requester_phone, blood_type, urgency, message } = 
      await req.json() as NotifyDonorRequest;

    console.log("Received notification request for donor:", donor_id);

    // Get donor info using the RPC function
    const { data: donorData, error: donorError } = await supabase
      .rpc("get_donor_contact_info", { p_donor_id: donor_id });

    if (donorError || !donorData || donorData.length === 0) {
      console.error("Failed to get donor info:", donorError);
      throw new Error("Donor not found");
    }

    const donor = donorData[0];
    console.log("Found donor:", donor.full_name);

    // Get donor's user_id from donors table
    const { data: donorRecord, error: donorRecordError } = await supabase
      .from("donors")
      .select("user_id")
      .eq("id", donor_id)
      .single();

    if (donorRecordError || !donorRecord) {
      console.error("Failed to get donor user_id:", donorRecordError);
      throw new Error("Donor record not found");
    }

    // Get donor's email from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", donorRecord.user_id)
      .single();

    const notificationMessage = `${requester_name} is urgently requesting ${blood_type} blood. Urgency: ${urgency}. Contact: ${requester_phone}${message ? `. Message: ${message}` : ""}`;

    const results = {
      inApp: false,
      sms: false,
      email: false,
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
          requester_name,
          requester_phone,
          blood_type,
          urgency,
        },
      });

    if (!notifError) {
      results.inApp = true;
      console.log("In-app notification created");
    } else {
      console.error("Failed to create in-app notification:", notifError);
    }

    // 2. Send SMS via Twilio
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && donor.phone) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append("To", donor.phone);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", `RedConnect Alert: ${notificationMessage}`);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (twilioResponse.ok) {
          results.sms = true;
          console.log("SMS sent successfully");
        } else {
          const errorText = await twilioResponse.text();
          console.error("Twilio error:", errorText);
        }
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
      }
    } else {
      console.log("SMS not configured or donor has no phone");
    }

    // 3. Send Email via Resend
    if (resendApiKey && profile?.email) {
      try {
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

        if (emailResponse.data?.id) {
          results.email = true;
          console.log("Email sent successfully");
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    } else {
      console.log("Email not configured or donor has no email");
    }

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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

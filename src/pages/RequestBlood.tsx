import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const bloodRequestSchema = z.object({
  patientName: z.string().trim().min(2, "Patient name must be at least 2 characters").max(100, "Patient name must be less than 100 characters"),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: "Please select a valid blood type" })
  }),
  unitsNeeded: z.number().int().min(1, "At least 1 unit is required").max(10, "Maximum 10 units allowed"),
  hospitalName: z.string().trim().min(3, "Hospital name must be at least 3 characters").max(150, "Hospital name must be less than 150 characters"),
  city: z.string().trim().min(2, "City must be at least 2 characters").max(50, "City must be less than 50 characters"),
  state: z.string().trim().min(2, "State must be at least 2 characters").max(50, "State must be less than 50 characters"),
  contactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
  urgencyLevel: z.enum(['Critical (Within hours)', 'Urgent (Within 24 hours)', 'Needed Soon (2-3 days)'], {
    errorMap: () => ({ message: "Please select urgency level" })
  }),
  additionalNotes: z.string().trim().max(500, "Additional notes must be less than 500 characters").optional().or(z.literal('')),
});

const RequestBlood = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    unitsNeeded: "1",
    hospital: "",
    city: "",
    state: "",
    contactNumber: "",
    urgency: "",
    additionalInfo: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = ["Critical (Within hours)", "Urgent (Within 24 hours)", "Needed Soon (2-3 days)"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate form data
    const validationResult = bloodRequestSchema.safeParse({
      patientName: formData.patientName,
      bloodGroup: formData.bloodGroup,
      unitsNeeded: parseInt(formData.unitsNeeded),
      hospitalName: formData.hospital,
      city: formData.city,
      state: formData.state,
      contactNumber: formData.contactNumber,
      urgencyLevel: formData.urgency,
      additionalNotes: formData.additionalInfo || '',
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("blood_requests")
        .insert({
          user_id: user.id,
          patient_name: validationResult.data.patientName,
          blood_type: validationResult.data.bloodGroup,
          units_needed: validationResult.data.unitsNeeded,
          hospital_name: validationResult.data.hospitalName,
          city: validationResult.data.city,
          state: validationResult.data.state,
          contact_number: validationResult.data.contactNumber,
          urgency_level: validationResult.data.urgencyLevel,
          additional_notes: validationResult.data.additionalNotes || null,
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your blood request has been posted. Nearby donors will be notified.",
      });
      
      navigate("/find-donor");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Request Blood</h1>
              <p className="text-muted-foreground text-lg">
                Post an urgent blood requirement and connect with donors
              </p>
            </div>

            {/* Alert Banner */}
            <Alert className="border-primary/50 bg-secondary/50">
              <AlertCircle className="text-primary" />
              <AlertDescription>
                Your request will be visible to all registered donors with matching blood types in your area.
              </AlertDescription>
            </Alert>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Blood Request Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Patient Name *</label>
                      <Input
                        placeholder="Full name"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Blood Group Required *</label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Units Needed *</label>
                      <Input
                        type="number"
                        placeholder="Number of units"
                        value={formData.unitsNeeded}
                        onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                        required
                        min="1"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hospital Name *</label>
                      <Input
                        placeholder="Name of hospital"
                        value={formData.hospital}
                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City *</label>
                      <Input
                        placeholder="City name"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State *</label>
                      <Input
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Number *</label>
                      <Input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Urgency Level *</label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencyLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Information</label>
                    <Textarea
                      placeholder="Any additional details about the requirement..."
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
                    <Send className="mr-2" size={18} />
                    {loading ? "Submitting..." : "Submit Blood Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RequestBlood;

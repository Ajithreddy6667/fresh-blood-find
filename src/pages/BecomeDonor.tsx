import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BecomeDonor = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    agreeTerms: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast({
        title: "Please agree to terms",
        description: "You must agree to the terms and conditions to register.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("donors")
        .insert({
          user_id: user.id,
          blood_type: formData.bloodType,
          date_of_birth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: "Welcome to BloodConnect. You're now part of our lifesaving community.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
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
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Heart className="fill-primary text-primary" size={60} />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Become a Donor</h1>
              <p className="text-muted-foreground text-lg">
                Join thousands of heroes saving lives through blood donation
              </p>
            </div>

            {/* Benefits Section */}
            <Card className="bg-secondary/30 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4 text-foreground">Why Register as a Donor?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-muted-foreground">Get notified when someone near you needs your blood type</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-muted-foreground">Track your donations and see the lives you've helped save</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-muted-foreground">Regular health checkups and blood screening at no cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Donor Registration Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Blood Type *</label>
                      <Select
                        value={formData.bloodType}
                        onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                        required
                        disabled={loading}
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date of Birth *</label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        required
                        disabled={loading}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address *</label>
                    <Input
                      placeholder="Your full address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City *</label>
                      <Input
                        placeholder="Your city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State *</label>
                      <Input
                        placeholder="Your state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, agreeTerms: checked as boolean })
                      }
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to be contacted when there's a blood donation request matching my blood type in my area.
                      I understand that donating blood is voluntary and I can opt out at any time.
                    </label>
                  </div>

                  <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
                    <Heart className="mr-2 fill-current" size={18} />
                    {loading ? "Registering..." : "Register as Donor"}
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

export default BecomeDonor;

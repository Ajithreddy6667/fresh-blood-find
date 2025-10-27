import { useState } from "react";
import { Mail, Phone, Clock, Send, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Contact Us</h1>
              <p className="text-muted-foreground text-lg">
                Need help? Have questions? We're here for you 24/7
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Contact Info Cards */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="bg-secondary rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold">Emergency Hotline</h3>
                  <p className="text-sm text-muted-foreground">+1 800 BLOOD-911</p>
                  <p className="text-xs text-muted-foreground">Available 24/7</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="bg-secondary rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold">Email Support</h3>
                  <p className="text-sm text-muted-foreground">help@bloodconnect.org</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="bg-secondary rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold">Main Office</h3>
                  <p className="text-sm text-muted-foreground">123 Life Ave, NY 10001</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Name *</label>
                      <Input
                        placeholder="Full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject *</label>
                      <Input
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message *</label>
                      <Textarea
                        placeholder="Tell us how we can help..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" variant="hero">
                      <Send className="mr-2" size={18} />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ/Info Section */}
              <div className="space-y-6">
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={24} />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm opacity-90">
                      If you or someone you know needs urgent blood, please call our emergency hotline immediately.
                    </p>
                    <Button variant="outline" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      <Phone className="mr-2" size={18} />
                      Call Emergency Line
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">How do I register as a donor?</h4>
                      <p className="text-sm text-muted-foreground">
                        Visit our "Become a Donor" page and fill out the registration form. It takes less than 5 minutes.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Is blood donation safe?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, absolutely! All equipment is sterile and used only once. The process is supervised by trained medical professionals.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">How often can I donate?</h4>
                      <p className="text-sm text-muted-foreground">
                        You can donate whole blood every 56 days. Platelet and plasma donations can be made more frequently.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

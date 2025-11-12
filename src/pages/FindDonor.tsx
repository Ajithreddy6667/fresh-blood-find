import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Phone, Droplet } from "lucide-react";
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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Donor {
  id: string;
  blood_type: string;
  city: string;
  state: string;
  full_name?: string;
  phone?: string | null;
}

const FindDonor = () => {
  const { toast } = useToast();
  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const fetchDonors = async () => {
    setLoading(true);
    try {
      // Use the secure donor_directory view
      let donorQuery = supabase
        .from("donor_directory")
        .select("*");

      if (bloodGroup) {
        donorQuery = donorQuery.eq("blood_type", bloodGroup);
      }

      if (location) {
        donorQuery = donorQuery.ilike("city", `%${location}%`);
      }

      const { data: donorData, error: donorError } = await donorQuery;
      if (donorError) throw donorError;

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && donorData && donorData.length > 0) {
        // Authenticated users can get contact info via SECURITY DEFINER function
        const donorsWithContact = await Promise.all(
          donorData.map(async (donor) => {
            try {
              const { data: contactData } = await supabase
                .rpc("get_donor_contact_info", { p_donor_id: donor.id });
              
              if (contactData && contactData.length > 0) {
                return {
                  ...donor,
                  full_name: contactData[0].full_name,
                  phone: contactData[0].phone
                };
              }
              return donor;
            } catch {
              // If contact fetch fails, return donor without contact info
              return donor;
            }
          })
        );
        setDonors(donorsWithContact as Donor[]);
      } else {
        // Unauthenticated users see directory without contact details
        setDonors(donorData as Donor[]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching donors",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Find a Blood Donor</h1>
              <p className="text-muted-foreground text-lg">
                Search for available blood donors in your area
              </p>
            </div>

            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="text-primary" />
                  Search Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Blood Group</label>
                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
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
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="Enter city or area"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full mt-6" variant="hero" onClick={fetchDonors} disabled={loading}>
                  <Search className="mr-2" size={18} />
                  {loading ? "Searching..." : "Search Donors"}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Available Donors {donors.length > 0 && `(${donors.length})`}
              </h2>
              {donors.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Droplet className="mx-auto text-muted-foreground mb-4" size={48} />
                    <p className="text-muted-foreground">
                      {loading ? "Searching for donors..." : "No donors found. Try adjusting your search criteria."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {donors.map((donor) => (
                    <Card key={donor.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold">
                                {donor.blood_type}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {donor.full_name || "Donor Available"}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin size={14} />
                                  {donor.city}, {donor.state}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {donor.phone ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`tel:${donor.phone}`}>
                                  <Phone size={16} className="mr-2" />
                                  Contact
                                </a>
                              </Button>
                            ) : (
                              <Link to="/auth">
                                <Button variant="outline" size="sm">
                                  <Phone size={16} className="mr-2" />
                                  Login to Contact
                                </Button>
                              </Link>
                            )}
                            <Link to="/request-blood">
                              <Button variant="default" size="sm">
                                Request Blood
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Info Banner */}
            <Card className="bg-secondary border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Droplet className="text-primary flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Can't find a match?</h3>
                    <p className="text-sm text-muted-foreground">
                      Post an urgent blood request and we'll notify nearby donors with matching blood types.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Nearby Locations</h2>
              <MapSection />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FindDonor;

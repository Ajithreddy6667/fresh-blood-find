import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Droplet, Clock, Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface DonorInfo {
  id: string;
  blood_type: string;
  last_donation_date: string | null;
  is_available: boolean;
  city: string;
  state: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

const DonorDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donorInfo, setDonorInfo] = useState<DonorInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const DONATION_COOLDOWN_DAYS = 90; // 3 months

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchDonorData();
    fetchNotifications();
  }, [user, navigate]);

  const fetchDonorData = async () => {
    try {
      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No donor profile found
          setDonorInfo(null);
        } else {
          throw error;
        }
      } else {
        setDonorInfo(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching donor info",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const calculateEligibility = () => {
    if (!donorInfo?.last_donation_date) {
      return { eligible: true, daysRemaining: 0, nextEligibleDate: null };
    }

    const lastDonation = new Date(donorInfo.last_donation_date);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + DONATION_COOLDOWN_DAYS);
    
    const today = new Date();
    const daysRemaining = Math.ceil((nextEligible.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      eligible: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
      nextEligibleDate: nextEligible,
    };
  };

  const { eligible, daysRemaining, nextEligibleDate } = calculateEligibility();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!donorInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-2xl text-center space-y-6">
            <Droplet className="mx-auto text-primary" size={64} />
            <h1 className="text-3xl font-bold">Become a Donor First</h1>
            <p className="text-muted-foreground">
              You haven't registered as a donor yet. Register now to access your dashboard.
            </p>
            <Button onClick={() => navigate("/become-donor")} variant="hero">
              Register as Donor
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Donor Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your donor profile and view blood requests
              </p>
            </div>

            {/* Eligibility Card */}
            <Card className={eligible ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {eligible ? (
                    <CheckCircle className="text-green-600" size={28} />
                  ) : (
                    <AlertTriangle className="text-orange-600" size={28} />
                  )}
                  Donation Eligibility Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {eligible ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-green-700 dark:text-green-400">
                      ✓ You are eligible to donate blood!
                    </p>
                    <p className="text-muted-foreground">
                      Your body has recovered from your last donation. You can safely donate blood again.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Clock className="text-orange-600" size={24} />
                      <div>
                        <p className="text-lg font-medium text-orange-700 dark:text-orange-400">
                          {daysRemaining} days until you can donate again
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Next eligible date: {nextEligibleDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-background/80 rounded-lg p-4 space-y-2">
                      <p className="font-medium flex items-center gap-2">
                        <AlertTriangle size={16} className="text-orange-600" />
                        Important Reminder
                      </p>
                      <p className="text-sm text-muted-foreground">
                        After donating blood, you must wait at least <strong>3 months (90 days)</strong> before 
                        donating again. This allows your body to fully replenish red blood cells and iron stores.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donor Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="text-primary" />
                    Blood Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">{donorInfo.blood_type}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-primary" />
                    Last Donation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-medium">
                    {donorInfo.last_donation_date 
                      ? new Date(donorInfo.last_donation_date).toLocaleDateString()
                      : "No donations recorded"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Availability Status */}
            <Card>
              <CardHeader>
                <CardTitle>Availability Status</CardTitle>
                <CardDescription>
                  Your current location: {donorInfo.city}, {donorInfo.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={donorInfo.is_available ? "default" : "secondary"} className="text-sm">
                  {donorInfo.is_available ? "Available for Donation" : "Currently Unavailable"}
                </Badge>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="text-primary" />
                  Blood Request Notifications
                </CardTitle>
                <CardDescription>
                  Requests from people who need your blood type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No notifications yet. You'll be notified when someone needs your blood type.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.is_read 
                            ? "bg-muted/30" 
                            : "bg-primary/5 border-primary/20"
                        }`}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        {notification.metadata?.requester_phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            asChild
                          >
                            <a href={`tel:${notification.metadata.requester_phone}`}>
                              Call Requester
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DonorDashboard;

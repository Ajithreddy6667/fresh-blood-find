import { Link } from "react-router-dom";
import { Heart, Users, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InfoCard from "@/components/InfoCard";
import StepCard from "@/components/StepCard";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="flex justify-center">
                <Heart className="fill-primary text-primary" size={80} />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Connecting Donors. <br />
                <span className="text-primary">Saving Lives.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Join our community of lifesavers. Find blood donors near you or become a hero by donating blood.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/find-donor">
                  <Button variant="hero" size="lg">
                    Find Donors Near You
                  </Button>
                </Link>
                <Link to="/become-donor">
                  <Button variant="outline" size="lg">
                    Become a Donor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Donate Blood Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Why Donate Blood?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <InfoCard
                icon={Heart}
                title="Save Lives"
                description="One donation can save up to three lives. Your contribution makes a real difference in emergency situations."
              />
              <InfoCard
                icon={Users}
                title="Help Your Community"
                description="Blood is always needed for accidents, surgeries, and chronic illnesses. Be there when your neighbors need you."
              />
              <InfoCard
                icon={Shield}
                title="Health Benefits"
                description="Regular blood donation can improve your health by reducing iron levels and helping detect potential health issues."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Getting started with BloodConnect is simple and straightforward
            </p>
            <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <StepCard
                step={1}
                title="Register"
                description="Sign up as a blood donor with your blood type, location, and contact details."
              />
              <StepCard
                step={2}
                title="Get Matched"
                description="Recipients can search for donors by blood group and location to find a match."
              />
              <StepCard
                step={3}
                title="Donate & Save"
                description="Connect with recipients, schedule a donation, and save a life!"
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <Clock size={48} className="mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Every Second Counts
              </h2>
              <p className="text-lg opacity-90">
                Someone needs blood every 2 seconds. Your donation can be the difference between life and death.
              </p>
              <Link to="/request-blood">
                <Button variant="outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-2">
                  Request Blood Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LocationMarker {
  id: number;
  name: string;
  type: "donor" | "bloodbank";
  lat: number;
  lng: number;
}

const MapSection = () => {
  const locations: LocationMarker[] = [
    { id: 1, name: "City Blood Bank", type: "bloodbank", lat: 40.7128, lng: -74.0060 },
    { id: 2, name: "John Smith (O+)", type: "donor", lat: 40.7282, lng: -73.9942 },
    { id: 3, name: "Memorial Hospital", type: "bloodbank", lat: 40.7489, lng: -73.9680 },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-secondary/20 h-96 flex items-center justify-center">
        {/* Placeholder for interactive map */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-primary/5" />
        <div className="relative z-10 text-center space-y-4 p-6">
          <MapPin className="text-primary mx-auto" size={48} />
          <h3 className="text-xl font-semibold text-foreground">Interactive Map Coming Soon</h3>
          <p className="text-muted-foreground max-w-md">
            View nearby blood donors and blood banks on an interactive map to quickly find help in your area.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-card px-4 py-2 rounded-full border border-border text-sm flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${loc.type === "donor" ? "bg-primary" : "bg-accent"}`} />
                <span className="text-foreground">{loc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MapSection;

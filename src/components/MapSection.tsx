import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface DonorLocation {
  id: string;
  blood_type: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

const MapSection = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(() => 
    localStorage.getItem("mapbox_token") || ""
  );
  const [tokenInput, setTokenInput] = useState("");
  const [donors, setDonors] = useState<DonorLocation[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Fetch donors from database
  useEffect(() => {
    const fetchDonors = async () => {
      const { data, error } = await supabase
        .from("donor_directory")
        .select("id, blood_type, city, state")
        .eq("is_available", true);

      if (!error && data) {
        // For demo purposes, assign approximate coordinates based on city/state
        // In production, you'd geocode addresses or store coordinates
        const donorsWithCoords = data.map((donor, index) => ({
          ...donor,
          // Spread donors around a central point (US center) for demo
          lat: 39.8283 + (Math.random() - 0.5) * 10,
          lng: -98.5795 + (Math.random() - 0.5) * 20,
        }));
        setDonors(donorsWithCoords);
      }
    };

    fetchDonors();
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-98.5795, 39.8283], // US center
        zoom: 3.5,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        setIsMapReady(true);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapboxToken("");
      localStorage.removeItem("mapbox_token");
    }

    return () => {
      map.current?.remove();
      map.current = null;
      setIsMapReady(false);
    };
  }, [mapboxToken]);

  // Add donor markers when map is ready
  useEffect(() => {
    if (!isMapReady || !map.current || donors.length === 0) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".donor-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add markers for each donor
    donors.forEach((donor) => {
      if (donor.lat && donor.lng) {
        const el = document.createElement("div");
        el.className = "donor-marker";
        el.style.cssText = `
          width: 32px;
          height: 32px;
          background: hsl(0, 72%, 51%);
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        el.innerHTML = donor.blood_type.replace(/_/g, "").replace("positive", "+").replace("negative", "-");

        new mapboxgl.Marker(el)
          .setLngLat([donor.lng, donor.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px;">
                <strong style="color: hsl(0, 72%, 51%);">${donor.blood_type.replace(/_/g, " ").replace("positive", "+").replace("negative", "-")}</strong>
                <p style="margin: 4px 0 0; color: #666;">${donor.city}, ${donor.state}</p>
              </div>
            `)
          )
          .addTo(map.current!);
      }
    });
  }, [isMapReady, donors]);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem("mapbox_token", tokenInput.trim());
      setMapboxToken(tokenInput.trim());
    }
  };

  if (!mapboxToken) {
    return (
      <Card className="overflow-hidden">
        <div className="relative bg-secondary/20 h-96 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-primary/5" />
          <div className="relative z-10 text-center space-y-4 p-6 max-w-md">
            <MapPin className="text-primary mx-auto" size={48} />
            <h3 className="text-xl font-semibold text-foreground">Setup Map View</h3>
            <p className="text-muted-foreground text-sm">
              Enter your Mapbox public token to view donor locations on the map.
              Get your free token at{" "}
              <a
                href="https://mapbox.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="pk.eyJ1..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveToken} disabled={!tokenInput.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-96">
        <div ref={mapContainer} className="absolute inset-0" />
        {donors.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-border shadow-lg">
            <p className="text-sm text-foreground font-medium">
              {donors.length} donor{donors.length !== 1 ? "s" : ""} available nearby
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MapSection;

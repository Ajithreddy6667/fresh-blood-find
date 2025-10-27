import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="fill-primary text-primary" size={20} />
            <span className="text-sm">
              © 2025 BloodConnect | Designed for Saving Lives
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Every donation counts. Every life matters.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

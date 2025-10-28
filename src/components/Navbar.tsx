import { Link, useNavigate } from "react-router-dom";
import { Heart, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/find-donor", label: "Find Donor" },
    { to: "/request-blood", label: "Request Blood" },
    { to: "/become-donor", label: "Become a Donor" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Heart className="fill-primary" size={28} />
            <span>BloodConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  <LogIn size={16} className="mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full mt-2">
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            ) : (
              <Link to="/auth" className="block mt-2">
                <Button variant="default" size="sm" className="w-full">
                  <LogIn size={16} className="mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

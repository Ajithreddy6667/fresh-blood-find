import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const InfoCard = ({ icon: Icon, title, description }: InfoCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-secondary rounded-full p-4">
            <Icon className="text-primary" size={32} />
          </div>
          <h3 className="font-bold text-xl text-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCard;

import { Card, CardContent } from "@/components/ui/card";
import { Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import FantasyBorder from "@/components/ui/fantasy-border";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
      <FantasyBorder className="w-full max-w-md mx-4 bg-card p-1">
        <Card className="w-full border-none shadow-none">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-6">
              <Skull className="h-16 w-16 text-destructive mb-4" />
              <h1 className="text-3xl font-cinzel font-bold text-primary text-center">
                Realm Not Found
              </h1>
            </div>

            <p className="mt-4 mb-6 text-md text-center text-foreground/80">
              Alas, brave adventurer! The mystical realm you seek lies beyond our maps.
              Perhaps the ancient scrolls at the Tavern's entrance will guide you to your destination.
            </p>
            
            <div className="flex justify-center">
              <Button asChild className="font-semibold">
                <Link href="/">Return to the Tavern</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FantasyBorder>
    </div>
  );
}

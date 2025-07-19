import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">How UX Heuristics Analysis Works</h1>
          <p className="text-lg text-muted-foreground">
            Understanding the methodology behind our UX analysis tool
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>What are Nielsen's Heuristics?</CardTitle>
              <CardDescription>The foundation of modern usability evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Jakob Nielsen's 10 usability heuristics are a set of principles for interface design
                established in 1994. These principles have become the cornerstone of usability
                evaluation worldwide.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">1. Visibility of system status</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep users informed about what's happening
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">2. Match between system and the real world</h3>
                  <p className="text-sm text-muted-foreground">
                    Speak the user's language and use familiar concepts
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">3. User control and freedom</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide "emergency exits" and undo capabilities
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">4. Consistency and standards</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow platform conventions and be consistent
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">5. Error prevention</h3>
                  <p className="text-sm text-muted-foreground">
                    Eliminate error-prone conditions or provide confirmations
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">6. Recognition rather than recall</h3>
                  <p className="text-sm text-muted-foreground">
                    Make objects, actions, and options visible
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">7. Flexibility and efficiency</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide accelerators for experienced users
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">8. Aesthetic and minimalist design</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep dialogs focused and avoid irrelevant information
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">9. Help recognize and recover from errors</h3>
                  <p className="text-sm text-muted-foreground">
                    Error messages should be clear and suggest solutions
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">10. Help and documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide searchable, focused, task-oriented help
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Our Analysis Works</CardTitle>
              <CardDescription>Our evaluation process explained</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our UX Heuristics Analyzer evaluates websites based on Nielsen's 10 usability principles through the following process:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>You enter a website URL to analyze</li>
                <li>Our system evaluates the website against each of the 10 heuristics</li>
                <li>We generate a comprehensive report with scores for each principle</li>
                <li>You receive actionable recommendations to improve your site's usability</li>
              </ol>
              <p className="text-sm text-muted-foreground mt-4">
                Note: This is a demonstration tool. In a production environment, the analysis would involve more sophisticated algorithms and potentially manual expert review.
              </p>
            </CardContent>
          </Card>
          
          <div className="flex justify-center pt-6">
            <Link to="/">
              <Button size="lg">
                Try the Analyzer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
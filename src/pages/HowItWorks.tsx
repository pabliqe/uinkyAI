import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto p-4 max-w-3xl pt-8">
      <div className="flex flex-col space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">How It Works</h1>
          <p className="text-lg text-muted-foreground">
            Understanding how our UX heuristic analyzer evaluates your website
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What are Nielsen's Heuristics?</CardTitle>
            <CardDescription>
              A set of general principles for user interface design developed by Jakob Nielsen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Nielsen's heuristics are 10 general principles for user interface design. 
              They were developed by Jakob Nielsen and Rolf Molich in 1990, and later refined by Nielsen. 
              These principles are widely used in UX evaluation to identify problems in user interface design.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">1. Visibility of system status</h3>
                <p className="text-sm text-muted-foreground">The system should always keep users informed about what is happening, through appropriate feedback within reasonable time.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">2. Match between system and the real world</h3>
                <p className="text-sm text-muted-foreground">The system should speak the users' language, with words, phrases, and concepts familiar to the user, rather than system-oriented terms.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">3. User control and freedom</h3>
                <p className="text-sm text-muted-foreground">Users often choose system functions by mistake and will need a clearly marked "emergency exit" to leave the unwanted state.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">4. Consistency and standards</h3>
                <p className="text-sm text-muted-foreground">Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">5. Error prevention</h3>
                <p className="text-sm text-muted-foreground">Even better than good error messages is a careful design which prevents a problem from occurring in the first place.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">6. Recognition rather than recall</h3>
                <p className="text-sm text-muted-foreground">Minimize the user's memory load by making objects, actions, and options visible. Instructions should be visible or easily retrievable.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">7. Flexibility and efficiency of use</h3>
                <p className="text-sm text-muted-foreground">Accelerators — unseen by the novice user — may often speed up the interaction for the expert user such that the system can cater to both inexperienced and experienced users.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">8. Aesthetic and minimalist design</h3>
                <p className="text-sm text-muted-foreground">Dialogues should not contain information which is irrelevant or rarely needed. Every extra unit of information competes with the relevant units of information.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">9. Help users recognize, diagnose, and recover from errors</h3>
                <p className="text-sm text-muted-foreground">Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">10. Help and documentation</h3>
                <p className="text-sm text-muted-foreground">Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How Our Analyzer Works</CardTitle>
            <CardDescription>
              The process behind our automated UX heuristic analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <strong>Website Scraping</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  When you enter a URL, our system retrieves the website's content, 
                  including HTML structure, text, images, and interactive elements. 
                  This process uses a combination of browser-based scraping and 
                  serverless functions to handle CORS restrictions.
                </p>
              </li>
              <li>
                <strong>Content Analysis</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  The system analyzes the collected data, examining aspects like 
                  navigation structure, form implementation, error handling, 
                  visual design, and content organization.
                </p>
              </li>
              <li>
                <strong>Heuristic Evaluation</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  Each of Nielsen's 10 heuristics is evaluated against the website's 
                  implementation, with scores assigned based on how well the site 
                  adheres to these established UX principles.
                </p>
              </li>
              <li>
                <strong>Scoring and Recommendations</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  A score is calculated for each heuristic, along with specific 
                  findings and actionable recommendations for improvement. These 
                  are combined to create an overall usability score.
                </p>
              </li>
              <li>
                <strong>Results Storage (Optional)</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  If you provide your email, the analysis results can be saved 
                  to our database for future reference, allowing you to track 
                  improvements over time.
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitations</CardTitle>
            <CardDescription>
              Understanding what our tool can and cannot do
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              While our heuristic analyzer provides valuable insights, it's important 
              to understand its limitations:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className="text-sm text-muted-foreground">
                <strong>Static Analysis:</strong> The tool primarily analyzes the 
                static structure of a website rather than dynamic interactions.
              </li>
              <li className="text-sm text-muted-foreground">
                <strong>No User Testing:</strong> The analysis doesn't replace 
                actual user testing, which can reveal issues not detectable through 
                automated analysis.
              </li>
              <li className="text-sm text-muted-foreground">
                <strong>Context Limitations:</strong> The tool may not understand 
                specific industry requirements or specialized user needs.
              </li>
              <li className="text-sm text-muted-foreground">
                <strong>Access Restrictions:</strong> Some sites with strict security 
                measures may limit what our tool can analyze.
              </li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md mt-4">
              <p className="text-sm">
                For the most comprehensive UX evaluation, we recommend using this tool 
                as one part of a broader UX research strategy that includes user testing, 
                expert reviews, and contextual inquiry.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link to="/">Try the Analyzer Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
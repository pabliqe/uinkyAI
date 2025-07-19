import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { heuristicsData } from "@/data/heuristics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HeuristicResult {
  id: number;
  title: string;
  shortTitle: string;
  score: number;
  findings: string[];
  recommendations: string[];
  screenshot?: string;
}

interface HeuristicScoreCardProps {
  heuristic: HeuristicResult;
}

export default function HeuristicScoreCard({ heuristic }: HeuristicScoreCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Find the original heuristic data from our dataset
  const originalHeuristicData = heuristicsData.heuristics.find(h => h.id === heuristic.id);
  
  // Get score color based on value
  const getScoreColor = (score: number): string => {
    if (score < 30) return "text-red-600";
    if (score < 70) return "text-yellow-600";
    return "text-green-600";
  };
  
  // Get score icon based on value
  const getScoreIcon = (score: number) => {
    if (score < 30) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (score < 70) return <Info className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };
  
  // Get score status text
  const getScoreStatusText = (score: number): string => {
    if (score < 30) return "Critical Issues";
    if (score < 70) return "Needs Improvement";
    return "Well Implemented";
  };
  
  // Get score summary based on score and heuristic
  const getScoreSummary = (score: number, heuristicId: number): string => {
    if (score < 30) {
      switch(heuristicId) {
        case 1:
          return "Users are not adequately informed about system status. Critical feedback is missing.";
        case 2:
          return "The interface uses unfamiliar terminology and concepts that don't match users' real-world expectations.";
        case 3:
          return "Users lack control over their interactions, with limited ability to undo actions or exit processes.";
        case 4:
          return "The interface has significant inconsistencies in design, behavior, and terminology.";
        case 5:
          return "The system doesn't prevent errors effectively, leaving users vulnerable to mistakes.";
        case 6:
          return "The interface relies too heavily on users' memory rather than showing options clearly.";
        case 7:
          return "The system lacks flexibility, forcing all users into the same interaction pattern.";
        case 8:
          return "The interface is cluttered and visually overwhelming, with poor focus on important elements.";
        case 9:
          return "Error messages are unhelpful or technical, with poor guidance on how to recover.";
        case 10:
          return "Help documentation is missing, hard to find, or inadequate for user needs.";
        default:
          return "This aspect has critical issues that require immediate attention.";
      }
    } else if (score < 70) {
      switch(heuristicId) {
        case 1:
          return "Some feedback mechanisms exist but system status isn't consistently communicated throughout.";
        case 2:
          return "The interface mostly uses familiar concepts but some areas use technical or unfamiliar terminology.";
        case 3:
          return "Basic user control exists, but some actions can't be undone or exited easily.";
        case 4:
          return "The interface is somewhat consistent but has notable variations in patterns and behaviors.";
        case 5:
          return "Some error prevention mechanisms exist but they aren't comprehensive or consistently applied.";
        case 6:
          return "Most options are visible, but some functions require users to remember information.";
        case 7:
          return "The interface offers some flexibility but doesn't fully accommodate different user skill levels.";
        case 8:
          return "The design is generally clean but some areas are cluttered or lack clear visual hierarchy.";
        case 9:
          return "Error messages are clear but don't always provide helpful recovery suggestions.";
        case 10:
          return "Basic help exists but it's not comprehensive or well-integrated into the experience.";
        default:
          return "This aspect has moderate issues that should be improved for a better user experience.";
      }
    } else {
      switch(heuristicId) {
        case 1:
          return "The system effectively communicates status through appropriate feedback for all user actions.";
        case 2:
          return "The interface uses familiar real-world concepts and language that users can easily understand.";
        case 3:
          return "Users have excellent control with clear navigation paths, undo capabilities, and exit points.";
        case 4:
          return "The interface maintains strong consistency throughout, following both internal and platform conventions.";
        case 5:
          return "The system proactively prevents errors through constraints, confirmations, and smart defaults.";
        case 6:
          return "Options and actions are clearly visible, minimizing the need for users to recall information.";
        case 7:
          return "The interface accommodates both novice and expert users with multiple paths and shortcuts.";
        case 8:
          return "The design is clean and focused, with a strong visual hierarchy that guides users' attention.";
        case 9:
          return "Error messages are clear and helpful, offering specific guidance on how to recover.";
        case 10:
          return "Comprehensive, accessible help and documentation is available when users need it.";
        default:
          return "This aspect is well-implemented with only minor opportunities for improvement.";
      }
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="mr-2">
                {heuristic.id}
              </Badge>
              {heuristic.title}
            </CardTitle>
            <CardDescription>{originalHeuristicData?.description}</CardDescription>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(heuristic.score)}`}>
            {heuristic.score}%
          </div>
        </div>
        <Progress 
          value={heuristic.score} 
          className="mt-2"
          style={{
            backgroundColor: heuristic.score < 30 ? 'rgba(239, 68, 68, 0.2)' : heuristic.score < 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            '--progress-color': heuristic.score < 30 ? 'rgb(239, 68, 68)' : heuristic.score < 70 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)'
          } as React.CSSProperties}
        />
        
        <div className="mt-4">
          <Alert variant={heuristic.score < 30 ? "destructive" : heuristic.score < 70 ? "default" : "success"}>
            <div className="flex items-center gap-2">
              {getScoreIcon(heuristic.score)}
              <AlertTitle>{getScoreStatusText(heuristic.score)}</AlertTitle>
            </div>
            <AlertDescription>
              {getScoreSummary(heuristic.score, heuristic.id)}
            </AlertDescription>
          </Alert>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-0">
              <span>View details</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {getScoreIcon(heuristic.score)} Findings
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {heuristic.findings.map((finding, idx) => (
                  <li key={idx} className="text-sm">{finding}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1">
                {heuristic.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="text-sm">{recommendation}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium">Key Principles</h4>
              <ul className="list-disc pl-5 space-y-1">
                {originalHeuristicData?.keyPrinciples.map((principle, idx) => (
                  <li key={idx} className="text-sm">{principle}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Examples</h4>
              <div className="flex flex-wrap gap-1">
                {originalHeuristicData?.examples.map((example, idx) => (
                  <Badge key={idx} variant="secondary">{example}</Badge>
                ))}
              </div>
            </div>
            {/* Display screenshot if available */}
            {heuristic.screenshot && (
              <div className="space-y-2 pt-4">
                <h4 className="text-sm font-medium">Website Screenshot</h4>
                <div className="border rounded-md overflow-hidden shadow-sm">
                  <img 
                    src={`data:image/jpeg;base64,${heuristic.screenshot}`}
                    alt="Website Screenshot" 
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 italic text-center pt-1">
                  Screenshot captured during analysis
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
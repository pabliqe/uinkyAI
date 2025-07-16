import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, HelpCircle, Info, Mail, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import HeuristicScoreCard from "@/components/HeuristicScoreCard";
import { heuristicsData } from "@/data/heuristics";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HeuristicsAnalyzerPage() {
  // Try to load email from localStorage on component mount
  const getSavedEmail = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("uxAnalyzerEmail") || "";
    }
    return "";
  };
  
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState(getSavedEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [results, setResults] = useState<HeuristicResult[] | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [overallScore, setOverallScore] = useState(0);

  const analyzeWebsite = async () => {
    // Validate URL
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    // Email validation only if an email is provided
    if (email) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    // Prepare URL with protocol if missing
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = `https://${url}`;
    }

    try {
      const urlObj = new URL(processedUrl);
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('Invalid URL');
      }
      
      setIsLoading(true);
      toast.info("Analyzing website...");
      
      // Use the processed URL with protocol for analysis
      await analyzeUrl(processedUrl);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }
  };

  const analyzeUrl = async (processedUrl: string) => {
    try {
      // Simulate API call with random scores
      // In a real application, this would be an actual API call to a backend service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate deterministic scores for each heuristic based on URL properties
      const mockResults: HeuristicResult[] = heuristicsData.heuristics.map(heuristic => {
        // Get a deterministic score based on URL and heuristic ID
        const score = generateDeterministicScore(processedUrl, heuristic.id);
        return {
          id: heuristic.id,
          title: heuristic.title,
          shortTitle: heuristic.shortTitle,
          score,
          findings: generateMockFindings(score, heuristic.title),
          recommendations: generateMockRecommendations(score, heuristic.id)
        };
      });
      
      const totalScore = Math.round(mockResults.reduce((sum, h) => sum + h.score, 0) / mockResults.length);
      setOverallScore(totalScore);
      setResults(mockResults);
      setActiveTab("overview");
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze website. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate more detailed mock findings
  const generateMockFindings = (score: number, title: string): string[] => {
    const findings = [];
    const heuristicLower = title.toLowerCase();
    
    if (score < 30) {
      findings.push(`Major issues found with ${heuristicLower}`);
      findings.push(`Several critical problems need immediate attention`);
      
      if (title.includes("Visibility of system status")) {
        findings.push("Users are not informed about what is happening in the system");
        findings.push("Loading states and progress indicators are missing or misleading");
      } else if (title.includes("Match between system and the real world")) {
        findings.push("Interface uses technical jargon that users wouldn't understand");
        findings.push("Metaphors and concepts don't align with real-world expectations");
      } else if (title.includes("User control")) {
        findings.push("Limited or no ability to undo actions");
        findings.push("Users feel trapped in processes with no clear exit points");
      } else if (title.includes("Consistency")) {
        findings.push("Interface elements behave differently across the site");
        findings.push("Design patterns and terminology are inconsistent");
      } else if (title.includes("Error prevention")) {
        findings.push("High potential for user errors with no preventive measures");
        findings.push("Critical actions lack confirmation steps or safeguards");
      } else if (title.includes("Recognition")) {
        findings.push("Interface relies heavily on users remembering information");
        findings.push("Important options and controls are hidden from view");
      } else if (title.includes("Flexibility")) {
        findings.push("Interface is rigid with only one way to accomplish tasks");
        findings.push("No shortcuts or efficiency features for experienced users");
      } else if (title.includes("Aesthetic")) {
        findings.push("Interface is cluttered and visually overwhelming");
        findings.push("Poor visual hierarchy makes it difficult to focus on important elements");
      } else if (title.includes("recover from errors")) {
        findings.push("Error messages are technical and unhelpful");
        findings.push("No guidance on how to resolve issues when they occur");
      } else if (title.includes("Help and documentation")) {
        findings.push("Help documentation is missing or difficult to find");
        findings.push("Available help content is overly complex or outdated");
      }
    } else if (score < 70) {
      findings.push(`Some issues identified with ${heuristicLower}`);
      findings.push(`Moderate improvements needed in key areas`);
      
      if (title.includes("Visibility of system status")) {
        findings.push("Some feedback is provided but not consistently throughout the system");
        findings.push("Status indicators exist but could be more informative");
      } else if (title.includes("Match between system and the real world")) {
        findings.push("Most terminology is understandable but some sections use technical language");
        findings.push("Interface concepts are mostly familiar but with some confusing elements");
      } else if (title.includes("User control")) {
        findings.push("Basic undo functionality exists but isn't available everywhere");
        findings.push("Exit points are available but not always obvious");
      } else if (title.includes("Consistency")) {
        findings.push("Interface is mostly consistent with occasional deviations");
        findings.push("Some elements don't follow the established patterns");
      } else if (title.includes("Error prevention")) {
        findings.push("Some error prevention methods are in place but not comprehensive");
        findings.push("Critical actions have safeguards but minor actions may not");
      } else if (title.includes("Recognition")) {
        findings.push("Important options are visible but secondary functions require recall");
        findings.push("Interface sometimes forces users to remember information between screens");
      } else if (title.includes("Flexibility")) {
        findings.push("Interface offers some flexibility but could support more workflows");
        findings.push("Basic shortcuts exist but advanced functionality is limited");
      } else if (title.includes("Aesthetic")) {
        findings.push("Design is generally clean but some areas feel cluttered");
        findings.push("Visual hierarchy exists but could be more refined");
      } else if (title.includes("recover from errors")) {
        findings.push("Error messages are clear but don't always suggest solutions");
        findings.push("Recovery paths exist but could be more straightforward");
      } else if (title.includes("Help and documentation")) {
        findings.push("Basic help content exists but lacks depth or context-sensitivity");
        findings.push("Documentation is available but not well-integrated into the interface");
      }
    } else {
      findings.push(`Great implementation of ${heuristicLower}`);
      findings.push(`Minor improvements possible but overall well executed`);
      
      if (title.includes("Visibility of system status")) {
        findings.push("System provides clear, timely feedback on all user actions");
        findings.push("Progress indicators and status updates are well implemented");
      } else if (title.includes("Match between system and the real world")) {
        findings.push("Interface uses familiar language and concepts from users' world");
        findings.push("Metaphors and interactions match real-world expectations");
      } else if (title.includes("User control")) {
        findings.push("Comprehensive undo capabilities and clear navigation paths");
        findings.push("Users can easily exit processes and reverse actions");
      } else if (title.includes("Consistency")) {
        findings.push("Interface maintains strong consistency throughout");
        findings.push("Design patterns follow platform conventions and internal standards");
      } else if (title.includes("Error prevention")) {
        findings.push("Proactive error prevention through constraints and smart defaults");
        findings.push("Critical actions have appropriate safeguards");
      } else if (title.includes("Recognition")) {
        findings.push("Interface elements are clearly visible and recognizable");
        findings.push("Users rarely need to recall information between contexts");
      } else if (title.includes("Flexibility")) {
        findings.push("Interface accommodates both novice and expert users effectively");
        findings.push("Multiple paths and shortcuts available for common tasks");
      } else if (title.includes("Aesthetic")) {
        findings.push("Clean, minimalist design that focuses on important content");
        findings.push("Strong visual hierarchy guides users through the interface");
      } else if (title.includes("recover from errors")) {
        findings.push("Error messages are clear, helpful, and suggest specific solutions");
        findings.push("Recovery paths are straightforward and effective");
      } else if (title.includes("Help and documentation")) {
        findings.push("Comprehensive, context-sensitive help is readily available");
        findings.push("Documentation is well-structured, searchable, and task-oriented");
      }
    }
    
    return findings;
  };
  
  // Generate a deterministic score based on the URL and heuristic ID
  const generateDeterministicScore = (url: string, heuristicId: number): number => {
    // Parse the URL to get relevant components
    const urlObj = new URL(url);
    
    // Use various URL properties to generate a score
    const hostname = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Create a numeric hash from the hostname
    let hostnameValue = 0;
    for (let i = 0; i < hostname.length; i++) {
      hostnameValue += hostname.charCodeAt(i);
    }
    
    // Create a numeric value from the path
    let pathValue = 0;
    for (let i = 0; i < path.length; i++) {
      pathValue += path.charCodeAt(i);
    }
    
    // Combine these values with the heuristic ID to create a deterministic score
    // Different heuristics will have different scores for the same URL
    const baseScore = ((hostnameValue * 7 + pathValue * 3) % 73) + (heuristicId * 7);
    
    // Adjust to get a score between 1-100
    let finalScore = (baseScore % 100) + 1;
    
    // Apply some patterns based on heuristic types and common website characteristics
    // Popular domains tend to score better on usability
    if (hostname.includes('google') || hostname.includes('apple') || 
        hostname.includes('microsoft') || hostname.includes('amazon')) {
      finalScore = Math.min(100, finalScore + 25);
    }
    
    // Some patterns for specific heuristics
    if (heuristicId === 1 && urlObj.protocol === 'https:') {
      // System status - HTTPS sites typically do better
      finalScore = Math.min(100, finalScore + 10);
    }
    
    if (heuristicId === 8 && (hostname.includes('gov') || hostname.includes('edu'))) {
      // Aesthetic design - Government and education sites often score lower
      finalScore = Math.max(1, finalScore - 15);
    }
    
    return finalScore;
  };

  // Helper function to generate detailed recommendations
  const generateMockRecommendations = (score: number, heuristicId: number): string[] => {
    const recommendations = [];
    
    if (score < 30) {
      // Critical issues - major recommendations
      switch(heuristicId) {
        case 1: // System Status
          recommendations.push("Add visible loading indicators for all system operations");
          recommendations.push("Implement real-time status updates for user actions");
          recommendations.push("Create a system status dashboard for complex processes");
          break;
        case 2: // Real World Match
          recommendations.push("Replace technical terms with everyday language");
          recommendations.push("Conduct user research to align metaphors with user expectations");
          recommendations.push("Use familiar icons and symbols that match real-world equivalents");
          break;
        case 3: // User Control
          recommendations.push("Add undo functionality for all major actions");
          recommendations.push("Create clear exit points for multi-step processes");
          recommendations.push("Add confirmation dialogs for irreversible actions");
          break;
        case 4: // Consistency
          recommendations.push("Develop a design system with consistent UI components");
          recommendations.push("Standardize terminology across the interface");
          recommendations.push("Ensure navigation patterns are consistent throughout");
          break;
        case 5: // Error Prevention
          recommendations.push("Implement form validation with real-time feedback");
          recommendations.push("Add constraints to prevent incorrect inputs");
          recommendations.push("Use smart defaults based on user context");
          break;
        case 6: // Recognition vs Recall
          recommendations.push("Make all options visible in the interface");
          recommendations.push("Add contextual cues for available actions");
          recommendations.push("Minimize memory load by showing related information together");
          break;
        case 7: // Flexibility
          recommendations.push("Implement keyboard shortcuts for common actions");
          recommendations.push("Add customization options for user preferences");
          recommendations.push("Create alternative paths for accomplishing tasks");
          break;
        case 8: // Aesthetic Design
          recommendations.push("Simplify the interface by removing visual clutter");
          recommendations.push("Establish clear visual hierarchy with typography and spacing");
          recommendations.push("Use white space effectively to group related elements");
          break;
        case 9: // Error Recovery
          recommendations.push("Rewrite error messages to be clear and actionable");
          recommendations.push("Add specific guidance on how to recover from errors");
          recommendations.push("Use appropriate visual cues for error states");
          break;
        case 10: // Help & Documentation
          recommendations.push("Create searchable help documentation");
          recommendations.push("Implement contextual help for complex features");
          recommendations.push("Add tutorials for key user journeys");
          break;
        default:
          recommendations.push("Conduct a comprehensive review of this aspect");
          recommendations.push("Consider redesigning this feature completely");
      }
    } else if (score < 70) {
      // Moderate issues - targeted improvements
      switch(heuristicId) {
        case 1: // System Status
          recommendations.push("Improve consistency of feedback across the system");
          recommendations.push("Enhance progress indicators with more detailed information");
          recommendations.push("Add status messages for background processes");
          break;
        case 2: // Real World Match
          recommendations.push("Review terminology for clarity and familiarity");
          recommendations.push("Test metaphors with users to verify understanding");
          recommendations.push("Refine language to better match user expectations");
          break;
        case 3: // User Control
          recommendations.push("Expand undo capabilities to more areas of the interface");
          recommendations.push("Make back and cancel options more prominent");
          recommendations.push("Ensure users can pause or cancel operations in progress");
          break;
        case 4: // Consistency
          recommendations.push("Audit the interface for inconsistencies in design patterns");
          recommendations.push("Standardize interaction behavior across similar components");
          recommendations.push("Align with platform conventions where appropriate");
          break;
        case 5: // Error Prevention
          recommendations.push("Add additional validation to prevent common errors");
          recommendations.push("Improve warning messages before critical actions");
          recommendations.push("Implement auto-correction for minor input errors");
          break;
        case 6: // Recognition vs Recall
          recommendations.push("Make secondary functions more discoverable");
          recommendations.push("Add visual cues for related options");
          recommendations.push("Maintain context between different screens and states");
          break;
        case 7: // Flexibility
          recommendations.push("Add more keyboard shortcuts for power users");
          recommendations.push("Implement customizable workflows for frequent tasks");
          recommendations.push("Allow users to save preferences for repeated actions");
          break;
        case 8: // Aesthetic Design
          recommendations.push("Reduce visual complexity in busy areas");
          recommendations.push("Improve alignment and spacing for better readability");
          recommendations.push("Refine color usage for better hierarchy and focus");
          break;
        case 9: // Error Recovery
          recommendations.push("Enhance error messages with more specific solutions");
          recommendations.push("Create smoother recovery paths for common errors");
          recommendations.push("Add inline guidance for form validation issues");
          break;
        case 10: // Help & Documentation
          recommendations.push("Make help content more accessible throughout the interface");
          recommendations.push("Add more visual guides and examples to documentation");
          recommendations.push("Implement contextual tooltips for complex features");
          break;
        default:
          recommendations.push("Address the specific issues identified in findings");
          recommendations.push("Test improvements with real users");
      }
    } else {
      // Minor issues - refinements
      switch(heuristicId) {
        case 1: // System Status
          recommendations.push("Maintain the excellent feedback system in place");
          recommendations.push("Consider adding subtle animations for smoother transitions");
          recommendations.push("Test with users to identify any edge cases for improvement");
          break;
        case 2: // Real World Match
          recommendations.push("Continue using clear, familiar language");
          recommendations.push("Stay current with evolving user expectations");
          recommendations.push("Periodically verify metaphors still resonate with users");
          break;
        case 3: // User Control
          recommendations.push("Maintain the strong undo and navigation capabilities");
          recommendations.push("Consider adding history features for complex workflows");
          recommendations.push("Monitor usage patterns to identify any control pain points");
          break;
        case 4: // Consistency
          recommendations.push("Maintain the design system with regular updates");
          recommendations.push("Ensure new features follow established patterns");
          recommendations.push("Document standards for future development");
          break;
        case 5: // Error Prevention
          recommendations.push("Continue the strong error prevention approach");
          recommendations.push("Look for opportunities to predict user intent");
          recommendations.push("Consider advanced AI suggestions to prevent errors");
          break;
        case 6: // Recognition vs Recall
          recommendations.push("Maintain the visibility-focused interface design");
          recommendations.push("Consider enhancing contextual guidance for new users");
          recommendations.push("Monitor for any features that may become hidden as the system grows");
          break;
        case 7: // Flexibility
          recommendations.push("Maintain the balance between simplicity and power features");
          recommendations.push("Consider adding more advanced customization options");
          recommendations.push("Explore AI assistance for workflow optimization");
          break;
        case 8: // Aesthetic Design
          recommendations.push("Maintain the clean, focused design approach");
          recommendations.push("Consider subtle refinements to typography and spacing");
          recommendations.push("Stay current with evolving design standards");
          break;
        case 9: // Error Recovery
          recommendations.push("Maintain the clear, solution-focused error messaging");
          recommendations.push("Consider adding more contextual help for rare errors");
          recommendations.push("Monitor error logs to identify any remaining issues");
          break;
        case 10: // Help & Documentation
          recommendations.push("Maintain the comprehensive help system");
          recommendations.push("Consider adding video tutorials for complex tasks");
          recommendations.push("Implement user feedback mechanisms for documentation");
          break;
        default:
          recommendations.push("Maintain current implementation");
          recommendations.push("Consider sharing your approach as best practice");
      }
    }
    
    return recommendations;
  };

  // Get score color based on value
  const getScoreColor = (score: number): string => {
    if (score < 30) return "text-red-600";
    if (score < 70) return "text-yellow-600";
    return "text-green-600";
  };

  // Get score badge color based on value
  const getScoreBadgeColor = (score: number): string => {
    if (score < 30) return "bg-red-100 text-red-800";
    if (score < 70) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  // Get score icon based on value
  const getScoreIcon = (score: number) => {
    if (score < 30) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (score < 70) return <Info className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  // Function to send results via email
  const sendResultsByEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address to receive the results");
      return;
    }
    
    if (!results || !url) {
      toast.error("No analysis results to send");
      return;
    }
    
    try {
      setIsSendingEmail(true);
      
      // In a real application, this would make an API call to a server that sends emails
      // For demo purposes, we'll simulate the email sending process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create email content
      const emailContent = formatEmailContent(url, overallScore, results);
      console.log("Email content prepared:", emailContent);
      
      // Log that we would send this email
      console.log(`Would send email to: ${email}`);
      
      toast.success(`Analysis results sent to ${email}`, { 
        description: "Check your inbox for the detailed report" 
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  // Format the email content with the analysis results
  const formatEmailContent = (analyzeUrl: string, overall: number, resultsData: HeuristicResult[]) => {
    // Get domain name from URL for email subject
    const domain = new URL(analyzeUrl.startsWith('http') ? analyzeUrl : `https://${analyzeUrl}`).hostname;
    
    // Create summary section
    const summary = `
      UX Heuristics Analysis for: ${domain}
      Overall Score: ${overall}%
      Date: ${new Date().toLocaleDateString()}
      
      SUMMARY OF FINDINGS:
      ${resultsData.map(result => 
        `${result.shortTitle}: ${result.score}% - ${getScoreSummary(result.score)}`
      ).join('\n')}
    `;
    
    // Create detailed section
    const detailedAnalysis = resultsData.map(result => `
      ${result.title} (${result.score}%)
      -------------------------------------------
      
      Findings:
      ${result.findings.map(finding => `- ${finding}`).join('\n')}
      
      Recommendations:
      ${result.recommendations.map(rec => `- ${rec}`).join('\n')}
      
    `).join('\n\n');
    
    // Complete email content
    return {
      subject: `UX Heuristics Analysis for ${domain} - Score: ${overall}%`,
      body: summary + '\n\n' + 'DETAILED ANALYSIS:\n\n' + detailedAnalysis
    };
  };
  
  // Helper function for email summary
  const getScoreSummary = (score: number): string => {
    if (score < 30) return "Critical issues found";
    if (score < 70) return "Needs improvement";
    return "Well implemented";
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex flex-col space-y-8 items-center text-center">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">Get Free UX Analysis on your Site</h1>
          <p className="text-lg text-muted-foreground">
            This automated-AI heuristic analysis runs over the selected website of your preference. It's 100% free!
          </p>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <Input
                type="text"
                placeholder="www.yoursite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Input
                type="email"
                placeholder="work email (optional)"
                value={email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setEmail(newEmail);
                  // Save email to localStorage whenever it changes
                  if (typeof window !== "undefined") {
                    localStorage.setItem("uxAnalyzerEmail", newEmail);
                  }
                }}
                className="flex-1"
              />
              <div className="flex gap-4">
                <Button 
                  onClick={analyzeWebsite} 
                  disabled={isLoading}
                  className="flex-1 py-6 text-lg font-semibold"
                >
                  {isLoading ? "ANALYZING..." : "RUN"}
                </Button>
                
                <Button
                  onClick={() => {
                    if (email) {
                      const savedEmails = JSON.parse(localStorage.getItem("savedEmails") || "[]");
                      if (!savedEmails.includes(email)) {
                        savedEmails.push(email);
                        localStorage.setItem("savedEmails", JSON.stringify(savedEmails));
                        toast.success(`Email saved: ${email}`, { description: "This email has been saved to localStorage" });
                      } else {
                        toast.info(`Email already saved: ${email}`);
                      }
                    } else {
                      toast.error("Please enter an email to save");
                    }
                  }}
                  variant="outline"
                  className="px-4"
                  title="Save email to localStorage"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                </Button>
              </div>

              {/* Quick test buttons for sample sites */}
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Or try a sample site:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setUrl("google.com");
                      analyzeWebsite();
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 11V8L17 12L12 16V13H7V11H12Z" fill="currentColor" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M7 3C4.23858 3 2 5.23858 2 8V16C2 18.7614 4.23858 21 7 21H17C19.7614 21 22 18.7614 22 16V8C22 5.23858 19.7614 3 17 3H7ZM4 8C4 6.34315 5.34315 5 7 5H17C18.6569 5 20 6.34315 20 8V16C20 17.6569 18.6569 19 17 19H7C5.34315 19 4 17.6569 4 16V8Z" fill="currentColor" />
                    </svg>
                    Test Google
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setUrl("amazon.com");
                      analyzeWebsite();
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 11V8L17 12L12 16V13H7V11H12Z" fill="currentColor" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M7 3C4.23858 3 2 5.23858 2 8V16C2 18.7614 4.23858 21 7 21H17C19.7614 21 22 18.7614 22 16V8C22 5.23858 19.7614 3 17 3H7ZM4 8C4 6.34315 5.34315 5 7 5H17C18.6569 5 20 6.34315 20 8V16C20 17.6569 18.6569 19 17 19H7C5.34315 19 4 17.6569 4 16V8Z" fill="currentColor" />
                    </svg>
                    Test Amazon
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setUrl("facebook.com");
                      analyzeWebsite();
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 11V8L17 12L12 16V13H7V11H12Z" fill="currentColor" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M7 3C4.23858 3 2 5.23858 2 8V16C2 18.7614 4.23858 21 7 21H17C19.7614 21 22 18.7614 22 16V8C22 5.23858 19.7614 3 17 3H7ZM4 8C4 6.34315 5.34315 5 7 5H17C18.6569 5 20 6.34315 20 8V16C20 17.6569 18.6569 19 17 19H7C5.34315 19 4 17.6569 4 16V8Z" fill="currentColor" />
                    </svg>
                    Test Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setUrl("twitter.com");
                      analyzeWebsite();
                    }}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 11V8L17 12L12 16V13H7V11H12Z" fill="currentColor" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M7 3C4.23858 3 2 5.23858 2 8V16C2 18.7614 4.23858 21 7 21H17C19.7614 21 22 18.7614 22 16V8C22 5.23858 19.7614 3 17 3H7ZM4 8C4 6.34315 5.34315 5 7 5H17C18.6569 5 20 6.34315 20 8V16C20 17.6569 18.6569 19 17 19H7C5.34315 19 4 17.6569 4 16V8Z" fill="currentColor" />
                    </svg>
                    Test Twitter
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Your Score</TabsTrigger>
              <TabsTrigger value="detailed">Fix these issues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Score</CardTitle>
                  <CardDescription>
                    Aggregate score based on all 10 heuristic principles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className={`text-7xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore}%
                    </div>
                    <Progress 
                      value={overallScore} 
                      className="w-full mt-4"
                      style={{
                        backgroundColor: overallScore < 30 ? 'rgba(239, 68, 68, 0.2)' : overallScore < 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        '--progress-color': overallScore < 30 ? 'rgb(239, 68, 68)' : overallScore < 70 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)'
                      } as React.CSSProperties}
                    />
                  </div>
                  
                  {/* Send results via email button */}
                  {email && (
                    <Button 
                      onClick={() => sendResultsByEmail()} 
                      disabled={isSendingEmail}
                      className="w-full py-4 text-md font-medium bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      {isSendingEmail ? (
                        <>
                          <span className="animate-spin mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                          </span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-1" />
                          Send Results to {email}
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => {
                          setActiveTab("detailed");
                          // Use setTimeout to allow tab change before scrolling
                          setTimeout(() => {
                            const element = document.getElementById(`heuristic-${result.id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 100);
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between p-2 rounded-lg border hover:border-primary transition-colors">
                          <div className="flex items-center gap-2">
                            {getScoreIcon(result.score)}
                            <span className="font-medium">{result.shortTitle}</span>
                          </div>
                          <Badge variant="outline" className={getScoreBadgeColor(result.score)}>
                            {result.score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detailed" className="space-y-4 text-left">
              <ScrollArea className="h-[600px] pr-4">
                {results.map((result) => (
                  <div id={`heuristic-${result.id}`} key={result.id}>
                    <HeuristicScoreCard heuristic={result} />
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Bottom action buttons */}
        <div className="w-full max-w-xl mt-4">
          {/* Export as PDF button when results are available */}
          {results && (
            <Button 
              onClick={() => {
                toast.success("This is a frontend mockup. In a real app, this would generate a PDF of your analysis results.");
                console.log("Export as PDF clicked");
              }}
              variant="outline"
              className="w-full py-4 flex items-center justify-center gap-2 mb-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export as PDF
            </Button>
          )}

          {/* View Saved Emails button */}
          <Button 
            onClick={() => {
              const savedEmails = JSON.parse(localStorage.getItem("savedEmails") || "[]");
              if (savedEmails.length > 0) {
                toast.success("Saved Emails:", {
                  description: (
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      <ul className="list-disc pl-4">
                        {savedEmails.map((savedEmail: string, index: number) => (
                          <li key={index} className="text-sm">{savedEmail}</li>
                        ))}
                      </ul>
                    </div>
                  ),
                  duration: 5000,
                });
                console.log("Saved emails:", savedEmails);
              } else {
                toast.info("No emails saved yet");
              }
            }}
            variant="outline"
            className="w-full py-4 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            View Saved Emails
          </Button>
        </div>
      </div>
    </div>
  );
}

// Types for our app
interface HeuristicResult {
  id: number;
  title: string;
  shortTitle: string;
  score: number;
  findings: string[];
  recommendations: string[];
}
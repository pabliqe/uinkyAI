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
import { sendEmail } from "@/utils/email-service";
import { sendEmailApi } from "@/utils/email-api-service";

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
      // Use the web scraper to get page data
      toast.info("Scraping website content...");
      
      // Import dependencies
      const { analyzeHeuristics } = await import('@/utils/heuristics-analyzer');
      const { scrapeWebsiteApi } = await import('@/utils/api-service');
      const { CORSError } = await import('@/utils/web-scraper');
      
      try {
        // First, try to use the serverless function
        let scrapedData;
        let screenshot = null;
        
        try {
          // Get data from serverless function (includes screenshot)
          scrapedData = await scrapeWebsiteApi(processedUrl);
          
          // Extract screenshot from API response if available
          if (scrapedData.screenshot) {
            screenshot = scrapedData.screenshot;
            delete scrapedData.screenshot; // Remove from data to avoid duplication
          }
        } catch (apiError) {
          console.error("API scraping failed:", apiError);
          
          toast.warning("Serverless function not available. Trying browser fallback...", { 
            id: "scraping-mode" 
          });
          
          // Fall back to browser-based scraping if the API call fails
          const { scrapeWebPage } = await import('@/utils/web-scraper');
          scrapedData = await scrapeWebPage(processedUrl);
          
          // Try to capture a screenshot separately
          try {
            const { captureScreenshot } = await import('@/utils/screenshot-service');
            screenshot = await captureScreenshot(processedUrl);
          } catch (screenshotError) {
            console.error("Screenshot capture failed:", screenshotError);
          }
        }
        
        toast.info("Analyzing content against heuristics...");
        
        // Analyze the scraped data against heuristics
        const { results: heuristicResults, overallScore: totalScore } = analyzeHeuristics(scrapedData);
        
        // Map to HeuristicResult type
        const finalResults: HeuristicResult[] = heuristicResults.map(result => {
          return {
            id: result.id,
            title: result.title,
            shortTitle: result.shortTitle,
            score: result.score,
            findings: result.findings,
            recommendations: result.recommendations,
            screenshot: screenshot || undefined
          };
        });
        
        setOverallScore(totalScore);
        setResults(finalResults);
        setActiveTab("overview");
        
        toast.success("Analysis complete!");
      } catch (error) {
        console.error("Error during web scraping:", error);
        
        if (error instanceof CORSError) {
          // Show a more helpful error message for CORS issues
          toast.error("Browser security prevents direct website access", {
            description: "When deployed, this tool uses a serverless function to analyze websites without CORS issues.",
            duration: 8000
          });
        } else {
          toast.error(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
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
      
      // Create email content
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      const emailSubject = `UX Analysis Results for ${domain} - Score: ${overallScore}%`;
      const emailContent = formatEmailContent(url, overallScore, results);
      
      // Try to use the serverless function first
      try {
        // Send email using the serverless function
        const result = await sendEmailApi({
          to_email: email,
          subject: emailSubject,
          message_html: emailContent
        });
        
        if (result.success) {
          toast.success(`Analysis results sent to ${email}`, { 
            description: "Check your inbox for the detailed report" 
          });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
        
        console.log("Email sending result:", result);
      } catch (apiError) {
        console.error("API email sending failed:", apiError);
        
        toast.warning("Serverless function not available. Using browser fallback...");
        
        // Fall back to client-side email sending if the API call fails
        const result = await sendEmail({
          to_email: email,
          subject: emailSubject,
          message_html: emailContent
        });
        
        if (result.success) {
          toast.success(`Analysis results sent to ${email}`, { 
            description: "Check your inbox for the detailed report" 
          });
        } else {
          toast.error(`Failed to send email: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  // Format the email content with the analysis results with HTML formatting
  const formatEmailContent = (analyzeUrl: string, overall: number, resultsData: HeuristicResult[]) => {
    // Get domain name from URL
    const domain = new URL(analyzeUrl.startsWith('http') ? analyzeUrl : `https://${analyzeUrl}`).hostname;
    
    // Create summary section with HTML
    const summaryHtml = `
      <div style="margin-bottom: 25px;">
        <h2 style="color: #333;">UX Heuristics Analysis for: ${domain}</h2>
        <p><strong>Overall Score:</strong> <span style="font-size: 18px; ${overall < 30 ? 'color: #dc2626;' : overall < 70 ? 'color: #d97706;' : 'color: #16a34a;'}">${overall}%</span></p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h3 style="margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">SUMMARY OF FINDINGS</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${resultsData.map(result => 
            `<li style="margin-bottom: 8px; padding: 8px; border-left: 3px solid ${result.score < 30 ? '#dc2626' : result.score < 70 ? '#d97706' : '#16a34a'}; padding-left: 10px;">
              <strong>${result.shortTitle}:</strong> ${result.score}% - ${getScoreSummary(result.score)}
            </li>`
          ).join('')}
        </ul>
      </div>
    `;
    
    // Create detailed section with HTML
    const detailedHtml = `
      <div style="margin-top: 30px;">
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">DETAILED ANALYSIS</h3>
        
        ${resultsData.map(result => `
          <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <h4 style="margin-top: 0; color: ${result.score < 30 ? '#dc2626' : result.score < 70 ? '#d97706' : '#16a34a'};">
              ${result.title} (${result.score}%)
            </h4>
            
            <h5 style="margin-bottom: 8px;">Findings:</h5>
            <ul style="margin-top: 0;">
              ${result.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
            
            <h5 style="margin-bottom: 8px;">Recommendations:</h5>
            <ul style="margin-top: 0;">
              ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
    
    // Complete email content with HTML wrapper
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${summaryHtml}
        ${detailedHtml}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
          This analysis was generated by UX Heuristics Analyzer on ${new Date().toLocaleString()}
        </div>
      </div>
    `;
  };
  
  // Helper function for email summary
  const getScoreSummary = (score: number): string => {
    if (score < 30) return "Critical issues found";
    if (score < 70) return "Needs improvement";
    return "Well implemented";
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl pt-8">
      <div className="flex flex-col space-y-8 items-center text-center">
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-bold tracking-tight">Get Free UX Analysis on your Site</h1>
            <Badge variant="outline" className="text-xs font-normal">Version 1.2.0</Badge>
          </div>
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
              
              {/* Responsive grid for test buttons - 2 buttons per row on mobile, 4 on larger screens */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUrl("google.com")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1"
                >
                  Test Google
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUrl("amazon.com")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1"
                >
                  Test Amazon
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUrl("facebook.com")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1"
                >
                  Test Facebook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUrl("twitter.com")}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1"
                >
                  Test Twitter
                </Button>
              </div>
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
              <Button 
                onClick={analyzeWebsite} 
                disabled={isLoading}
                className="w-full py-6 text-lg font-semibold"
              >
                {isLoading ? "ANALYZING..." : "RUN"}
              </Button>

              {/* Sample site buttons moved up under URL input */}
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
                  
                  {/* Display screenshot in overview if available */}
                  {results && results[0]?.screenshot && (
                    <div className="space-y-2 pt-2">
                      <h3 className="text-sm font-medium text-center">Website Screenshot</h3>
                      <div className="border rounded-md overflow-hidden shadow-sm">
                        <img 
                          src={`data:image/jpeg;base64,${results[0].screenshot}`}
                          alt="Website Screenshot" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                  
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
              {/* Removed fixed height ScrollArea to let content grow naturally */}
              <div className="pr-4">
                {results.map((result) => (
                  <div id={`heuristic-${result.id}`} key={result.id}>
                    <HeuristicScoreCard heuristic={result} />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Removed bottom action buttons as requested */}
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
  screenshot?: string;
}
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Separator } from "../components/ui/separator";
import { Mail, Search } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { getAssessmentsByEmail, Assessment } from "../utils/supabase-service";
import { useNavigate } from "react-router-dom";

export default function ResultsPage() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const navigate = useNavigate();

  // Try to load email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("uxAnalyzerEmail") || "";
    setEmail(savedEmail);
    
    // If we have a saved email, fetch results automatically
    if (savedEmail) {
      fetchResults(savedEmail);
    }
  }, []);

  // Function to fetch results from Supabase
  const fetchResults = async (emailToFetch: string) => {
    if (!emailToFetch) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAssessmentsByEmail(emailToFetch);

      if (response.success && response.data) {
        setAssessments(response.data);
        
        // Save this email for future use
        localStorage.setItem("uxAnalyzerEmail", emailToFetch);
        
        if (response.data.length === 0) {
          toast.info("No analysis results found for this email");
        } else {
          toast.success(`Found ${response.data.length} analysis results`);
        }
      } else {
        toast.error(response.message || "Failed to retrieve results");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-8">
      <div className="flex flex-col space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Your Analysis Results</h1>
            <p className="text-lg text-muted-foreground">
              View your previous UX analyses from our database
            </p>
          </div>

          {/* Email input and search button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => fetchResults(email)}
                    disabled={isLoading}
                    className="md:w-auto w-full"
                  >
                    {isLoading ? "Searching..." : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Results
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results list */}
        {assessments.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analysis History</h2>
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Screenshot preview (if available) */}
                      {assessment.screenshot && (
                        <div className="md:w-1/4 w-full h-40 md:h-auto overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={`data:image/jpeg;base64,${assessment.screenshot}`}
                            alt="Website Screenshot"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      )}
                      
                      {/* Assessment details */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg truncate">
                              {assessment.url}
                            </h3>
                            <Badge variant="outline" className={getScoreBadgeColor(assessment.overall_score)}>
                              {assessment.overall_score}%
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4">
                            Analyzed on {formatDate(assessment.created_at)}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(assessment.scores).slice(0, 4).map(([key, score]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {score.title}: {score.score}%
                              </Badge>
                            ))}
                            {Object.keys(assessment.scores).length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{Object.keys(assessment.scores).length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline"
                          size="sm"
                          className="self-start"
                          onClick={() => {
                            // In a real application, this would navigate to a detailed view
                            // For now, we'll just show a toast message
                            toast.info("Detailed view would open here in a complete application");
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* No results message */}
        {assessments.length === 0 && email && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No analysis results found</h3>
              <p className="text-muted-foreground mt-2 text-center">
                We couldn't find any analysis results for {email}.<br />
                Try running a new analysis first.
              </p>
              <Button 
                className="mt-6" 
                onClick={() => navigate('/')}
              >
                Run New Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
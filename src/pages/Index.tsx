import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { AlertCircle, CheckCircle, HelpCircle, Info } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip } from "@radix-ui/react-tooltip";
import HeuristicScoreCard from "../components/HeuristicScoreCard";
import { heuristicsData } from "../data/heuristics";
import { ScrollArea } from "../components/ui/scroll-area";
import { submitAssessment } from "../utils/supabase-service";

interface HeuristicResult {
  id: number;
  title: string;
  shortTitle: string;
  score: number;
  findings: string[];
  recommendations: string[];
  screenshot?: string;
}

interface AnalysisResult {
  url: string;
  timestamp: string;
  overallScore: number;
  heuristicResults: HeuristicResult[];
}

export default function HeuristicsAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      toast.error("Invalid URL format. Please include http:// or https://");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Starting analysis...");

    try {
      // Call the web scraper service
      const response = await fetch("/api/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        toast.error(`Analysis error: ${data.error}`);
        setIsAnalyzing(false);
        return;
      }

      // Process results
      const results: AnalysisResult = {
        url,
        timestamp: new Date().toISOString(),
        overallScore: data.overallScore,
        heuristicResults: data.heuristicResults
      };

      setAnalysisResults(results);
      setActiveTab("results");
      
      // Store results in Supabase if email provided
      if (results) {
        try {
          await submitAssessment(results);
          toast.success("Results saved to your account");
        } catch (error) {
          console.error("Failed to save results:", error);
          toast.error("Failed to save results");
        }
      }
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score < 30) return "text-red-500";
    if (score < 70) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreIcon = (score: number) => {
    if (score < 30) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (score < 70) return <Info className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6 pb-12">
        <div className="space-y-2 text-center pt-6 pb-2">
          <h1 className="text-4xl font-bold tracking-tight">Nielsen's Heuristics Analyzer</h1>
          <p className="text-muted-foreground text-lg">
            Evaluate your website's usability with Nielsen's 10 heuristics
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="analyze">Analyze Website</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResults}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyze Your Website</CardTitle>
                <CardDescription>
                  Enter a website URL to evaluate its usability against Nielsen's 10 heuristics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isAnalyzing}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isAnalyzing || !url}>
                      {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analyzing website...</span>
                        <span>This may take a minute</span>
                      </div>
                      <Progress value={33} className="w-full" />
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <h3 className="font-semibold mb-2">What we analyze:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {heuristicsData.heuristics.map((heuristic) => (
                      <div key={heuristic.id} className="flex items-start gap-1">
                        <Badge variant="outline" className="mt-0.5">{heuristic.id}</Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm cursor-help flex items-center">
                                {heuristic.shortTitle}
                                <HelpCircle className="w-3 h-3 ml-1 inline" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="max-w-xs p-2">{heuristic.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>About Nielsen's Heuristics</CardTitle>
                <CardDescription>
                  A proven methodology to evaluate interface usability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Nielsen's Heuristics are 10 general principles for user interface design.
                  They were developed by Jakob Nielsen in 1994 and are widely used in UX evaluation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">What this tool does:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Analyzes websites against the 10 heuristics</li>
                      <li>Provides specific findings for each heuristic</li>
                      <li>Offers actionable recommendations</li>
                      <li>Scores each heuristic and overall usability</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Limitations:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Can't replace human UX evaluation</li>
                      <li>May miss context-specific issues</li>
                      <li>Some sites may block automated analysis</li>
                      <li>Focuses on UI patterns, not business goals</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            {analysisResults && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Analysis Results</CardTitle>
                        <CardDescription>
                          Usability analysis for <span className="font-medium">{analysisResults.url}</span>
                        </CardDescription>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-2">
                          {getScoreIcon(analysisResults.overallScore)}
                          <span className={`text-4xl font-bold ${getScoreColor(analysisResults.overallScore)}`}>
                            {Math.round(analysisResults.overallScore)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Overall Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                      {heuristicsData.heuristics.map(heuristic => {
                        const result = analysisResults.heuristicResults.find(h => h.id === heuristic.id);
                        return result ? (
                          <Card key={heuristic.id} className="overflow-hidden">
                            <CardHeader className="p-3 pb-2">
                              <div className="flex justify-between items-center">
                                <Badge variant="outline">{heuristic.id}</Badge>
                                <span className={`font-bold ${getScoreColor(result.score)}`}>
                                  {result.score}%
                                </span>
                              </div>
                              <CardTitle className="text-sm mt-2">{heuristic.shortTitle}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <Progress 
                                value={result.score} 
                                className="h-1.5"
                                style={{
                                  backgroundColor: result.score < 30 ? 'rgba(239, 68, 68, 0.2)' : result.score < 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                  '--progress-color': result.score < 30 ? 'rgb(239, 68, 68)' : result.score < 70 ? 'rgb(245, 158, 11)' : 'rgb(34, 197, 94)'
                                } as React.CSSProperties}
                              />
                            </CardContent>
                          </Card>
                        ) : null;
                      })}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Detailed Results</h3>
                      <ScrollArea className="h-[600px] rounded-md border p-4">
                        <div className="space-y-6 pr-4">
                          {analysisResults.heuristicResults.map((heuristic) => (
                            <HeuristicScoreCard key={heuristic.id} heuristic={heuristic} />
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
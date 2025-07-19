import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { ClipboardIcon } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/>
            <path d="M4 2v4"/>
            <path d="M4 10v4"/>
            <path d="M10 2v.5"/>
            <path d="M14 2v.5"/>
            <path d="M18 2v.5"/>
            <path d="M18 10a4 4 0 0 1-4 4 4 4 0 0 1 0-8 4 4 0 0 1 4 4Z"/>
          </svg>
          <span className="font-bold text-xl text-primary">UX Analyzer</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/results">
            <Button variant="ghost" size="sm" className="gap-2">
              <ClipboardIcon className="h-4 w-4" />
              My Results
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="ghost" size="sm" className="gap-2">
              <QuestionMarkCircledIcon className="h-4 w-4" />
              How It Works
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-bold">Nielsen's Heuristics Analyzer</Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/how-it-works">How It Works</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/results">View Results</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
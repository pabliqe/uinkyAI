import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  );
}
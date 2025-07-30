import { TrendAnalysisForm } from "@/components/trend-analysis-form";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TrendsPage() {
  return (
    <div>
        <Button asChild variant="outline" className="mb-4">
            <Link href="/dashboard/csd">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to CSD Dashboard
            </Link>
        </Button>
      <h1 className="text-2xl font-bold mb-4 font-headline">AI Trend Analysis</h1>
      <TrendAnalysisForm />
      <Toaster />
    </div>
  );
}

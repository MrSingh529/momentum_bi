import { TrendComparison } from "@/components/trend-comparison";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MonthWiseTrendsPage() {
  return (
    <div className="space-y-4">
        <Button asChild variant="outline">
            <Link href="/dashboard/csd">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to CSD Dashboard
            </Link>
        </Button>
      <TrendComparison />
    </div>
  );
}

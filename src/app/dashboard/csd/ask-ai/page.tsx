import { CsdAskAiForm } from "@/components/csd-ask-ai-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function AskAiPage() {
  return (
    <div className="space-y-4">
      <Button asChild variant="outline">
        <Link href="/dashboard/csd">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to CSD Dashboard
        </Link>
      </Button>
      <CsdAskAiForm />
      <Toaster />
    </div>
  );
}

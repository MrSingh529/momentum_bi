import { AskAiForm } from "@/components/ask-ai-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function AskAiPage() {
  return (
    <div className="space-y-4">
      <Button asChild variant="outline">
        <Link href="/dashboard/presales">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pre-Sales Dashboard
        </Link>
      </Button>
      <AskAiForm />
      <Toaster />
    </div>
  );
}

"use client";

import { ImportDataForm } from "@/components/import-data-form";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ImportPage() {
  return (
    <div className="w-full max-w-lg mx-auto">
        <Button asChild variant="outline" className="mb-4">
            <Link href="/dashboard/csd">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to CSD Dashboard
            </Link>
        </Button>
      <ImportDataForm redirectPath="/dashboard/csd" />
      <Toaster />
    </div>
  );
}

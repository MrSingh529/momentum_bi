"use client";

import { useFormState, useFormStatus } from "react-dom";
import { upload, FormState } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, AlertTriangle, Loader, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from "next/navigation";

const initialState: FormState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" /> Uploading...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" /> Upload File
        </>
      )}
    </Button>
  );
}

export function ImportDataForm({sheetName, redirectPath}: {sheetName?: string, redirectPath: string}) {
  const [state, formAction] = useFormState(upload, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Success",
          description: state.message,
        });
        formRef.current?.reset();
        // Redirect to dashboard after successful upload
        setTimeout(() => router.push(redirectPath), 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
      }
    }
  }, [state, toast, router, redirectPath]);

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Import Dashboard Data</CardTitle>
        <CardDescription>
          Upload an Excel file with '{sheetName || "Calls' and 'Inventory"}' sheet(s) to populate the dashboard.
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Excel File</Label>
            <Input id="file" name="file" type="file" required accept=".xlsx, .xls" />
            {sheetName && <input type="hidden" name="sheetName" value={sheetName} />}
          </div>
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

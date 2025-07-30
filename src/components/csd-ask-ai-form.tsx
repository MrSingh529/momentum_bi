"use client";

import { useFormState, useFormStatus } from "react-dom";
import { csdAsk, FormState } from "@/app/actions/csd-ask";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertTriangle, Loader, HelpCircle, User } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCallsData, getInventoryData } from "@/app/actions/upload";
import { Separator } from "./ui/separator";

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
          <Loader className="mr-2 h-4 w-4 animate-spin" /> Asking AI...
        </>
      ) : (
         <>
            <Sparkles className="mr-2 h-4 w-4" />
            Ask Question
        </>
      )}
    </Button>
  );
}

const suggestedQuestions = [
    "Which service center has the highest total calls?",
    "What is the total inventory value for Zainul Infotech?",
    "List all service centers with 'High Risk' status.",
    "Compare the total calls and cancelled calls for 'P N Enterprise' and 'Mobile seva'."
];

export function CsdAskAiForm() {
  const [state, formAction] = useFormState(csdAsk, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [callsDataString, setCallsDataString] = useState("");
  const [inventoryDataString, setInventoryDataString] = useState("");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    async function loadData() {
        const calls = await getCallsData();
        if(calls && calls.length > 0) {
            setCallsDataString(JSON.stringify(calls));
        }
        const inventory = await getInventoryData();
        if(inventory && inventory.length > 0) {
            setInventoryDataString(JSON.stringify(inventory));
        }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!state.success && state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
    if (state.success) {
      // We no longer clear the question here to persist it in the textarea
      // setQuestion("");
    }
  }, [state, toast]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Ask About Your CSD Data</CardTitle>
            <CardDescription>
              Use natural language to ask questions about your uploaded calls and inventory data.
            </CardDescription>
          </CardHeader>
          <form ref={formRef} action={formAction}>
            <CardContent className="space-y-4">
              <input type="hidden" name="callsData" value={callsDataString} />
              <input type="hidden" name="inventoryData" value={inventoryDataString} />
              <div className="space-y-2">
                <Textarea
                  id="question"
                  name="question"
                  placeholder="e.g., How many service centers are active?"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Or try a suggestion:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map(q => (
                        <Button key={q} variant="outline" size="sm" onClick={() => handleSuggestionClick(q)} type="button">
                            {q}
                        </Button>
                    ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <SubmitButton />
              <p className="text-xs text-center text-muted-foreground">
                Note: Remember, even AIs enjoy short coffee breaks—please wait a few seconds before your next query.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        {state.success && state.data ? (
           <Card className="shadow-lg animate-in fade-in-50">
           <CardContent className="p-6 space-y-4">
               {state.question && (
                   <div className="space-y-2">
                       <div className="flex items-center gap-2">
                           <User className="h-5 w-5 text-muted-foreground"/>
                           <h3 className="font-semibold">Your Question</h3>
                       </div>
                       <p className="text-sm text-muted-foreground italic">"{state.question}"</p>
                   </div>
               )}
               <Separator />
               <div className="space-y-2">
                   <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">AI Response</h3>
                   </div>
                   <p className="text-sm text-foreground whitespace-pre-wrap">{state.data.answer}</p>
               </div>
           </CardContent>
         </Card>
        ) : (
          <Card className="flex h-full items-center justify-center bg-card-foreground/5 shadow-inner">
            <div className="text-center text-muted-foreground p-8">
              <HelpCircle className="mx-auto h-12 w-12" />
              <p className="mt-4 font-semibold">Your answer will appear here</p>
              <p className="text-sm">Ask a question or try one of the suggestions to get started.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

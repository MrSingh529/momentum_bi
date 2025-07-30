"use client";

import { useFormState, useFormStatus } from "react-dom";
import { analyze, FormState } from "@/app/actions/analyze";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, AlertTriangle, Loader, BarChart, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCallsData, getInventoryData } from "@/app/actions/upload";

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
          <Loader className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
        </>
      ) : (
        "Run Analysis"
      )}
    </Button>
  );
}

export function TrendAnalysisForm() {
  const [state, formAction] = useFormState(analyze, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [serviceCenters, setServiceCenters] = useState<string[]>([]);
  const [callsData, setCallsData] = useState<string>("");
  const [inventoryData, setInventoryData] = useState<string>("");

  useEffect(() => {
    async function loadData() {
        const calls = await getCallsData();
        if(calls && calls.length > 0) {
            const uniqueMonths = [...new Set(calls.map((c: any) => c.month))];
            const uniqueCenters = [...new Set(calls.map((c: any) => c.center))];
            setMonths(uniqueMonths as string[]);
            setServiceCenters(uniqueCenters as string[]);
        }
    }
    loadData();
  }, [])

  useEffect(() => {
    if (!state.success && state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
    if (state.success) {
        formRef.current?.reset();
        setCallsData("");
        setInventoryData("");
    }
  }, [state, toast]);

  const handleSelectionChange = async (type: 'month' | 'serviceCenter', value: string) => {
    const form = formRef.current;
    if (!form) return;
  
    const formData = new FormData(form);
    const month = type === 'month' ? value : formData.get('month');
    const serviceCenter = type === 'serviceCenter' ? value : formData.get('serviceCenter');
  
    if (month && serviceCenter) {
      const calls = await getCallsData();
      const inventory = await getInventoryData();
  
      const centerCalls = calls.find((c: any) => c.month === month && c.center === serviceCenter);
      const centerInventory = inventory.find((i: any) => i.month === month && i.center === serviceCenter);
  
      if (centerCalls) {
        setCallsData(`Total calls: ${centerCalls.totalCalls}, Cancelled calls: ${centerCalls.cancelledCalls}`);
      } else {
        setCallsData("");
      }
  
      if (centerInventory) {
        setInventoryData(`Available: ${centerInventory.available}, Occupied: ${centerInventory.occupied}, In-transit: ${centerInventory.inTransit}`);
      } else {
        setInventoryData("");
      }
    }
  };
  

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Trend Analysis</CardTitle>
          <CardDescription>
            Input data to generate trend analysis and optimization suggestions.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select name="month" required onValueChange={(value) => handleSelectionChange('month', value)}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceCenter">Service Center</Label>
                <Select name="serviceCenter" required onValueChange={(value) => handleSelectionChange('serviceCenter', value)}>
                  <SelectTrigger id="serviceCenter">
                    <SelectValue placeholder="Select a center" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCenters.map(sc => <SelectItem key={sc} value={sc}>{sc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="callsData">Calls Data</Label>
              <Textarea
                id="callsData"
                name="callsData"
                placeholder="Data will populate after selection..."
                required
                value={callsData}
                onChange={(e) => setCallsData(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventoryData">Inventory Data</Label>
              <Textarea
                id="inventoryData"
                name="inventoryData"
                placeholder="Data will populate after selection..."
                required
                value={inventoryData}
                onChange={(e) => setInventoryData(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        {state.success && state.data ? (
          <>
            <Card className="shadow-lg animate-in fade-in-50">
              <CardHeader className="flex flex-row items-center gap-4">
                <BarChart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="font-headline">Trend Analysis</CardTitle>
                  <CardDescription>Generated insights on performance trends.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{state.data.trendAnalysis}</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg animate-in fade-in-50 delay-150">
              <CardHeader className="flex flex-row items-center gap-4">
                 <Package className="h-8 w-8 text-accent" />
                 <div>
                    <CardTitle className="font-headline">Optimization Suggestions</CardTitle>
                    <CardDescription>Actionable steps for improvement.</CardDescription>
                 </div>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-foreground">{state.data.optimizationSuggestions}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex h-full items-center justify-center bg-card-foreground/5 shadow-inner">
            <div className="text-center text-muted-foreground">
              <Lightbulb className="mx-auto h-12 w-12" />
              <p className="mt-4 font-semibold">Your analysis will appear here</p>
              <p className="text-sm">Select a month and service center to get started</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

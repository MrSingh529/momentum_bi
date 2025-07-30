"use client";

import { useEffect, useState } from "react";
import { getCallsData } from "@/app/actions/upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, ShieldX, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type RiskCounts = {
  "Top High Risk": number;
  "High Risk": number;
  "No Risk": number;
};

export function RiskAssessmentCard() {
  const [riskCounts, setRiskCounts] = useState<RiskCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getCallsData();
      if (data && data.length > 0) {
        const months = [...new Set(data.map((item: any) => item.month))];
        let lastMonth = months[months.length - 1];
        if (months.includes("July")) lastMonth = "July";
        else if (months.includes("June")) lastMonth = "June";
        else if (months.includes("May")) lastMonth = "May";

        const latestData = data.filter((item: any) => item.month === lastMonth);
        
        const counts = latestData.reduce(
          (acc, item) => {
            const risk = item.risk;
            if (acc.hasOwnProperty(risk)) {
              acc[risk as keyof RiskCounts]++;
            }
            return acc;
          },
          { "Top High Risk": 0, "High Risk": 0, "No Risk": 0 }
        );
        setRiskCounts(counts);
      } else {
        setRiskCounts(null);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const riskLevels = [
    { 
        level: "Top High Risk", 
        icon: <ShieldAlert className="h-8 w-8 text-destructive" />, 
        count: riskCounts ? riskCounts["Top High Risk"] : 0
    },
    { 
        level: "High Risk", 
        icon: <ShieldX className="h-8 w-8 text-amber-500" />,
        count: riskCounts ? riskCounts["High Risk"] : 0
    },
    { 
        level: "No Risk", 
        icon: <ShieldCheck className="h-8 w-8 text-green-600" />, 
        count: riskCounts ? riskCounts["No Risk"] : 0
    },
  ];

  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>Overall operational risk levels</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
            <p>Loading data...</p>
        ) : riskCounts ? (
            riskLevels.map(({ level, icon, count }) => (
                <div key={level} className="flex items-start gap-4">
                  {icon}
                  <div>
                    <p className="font-semibold">{level}</p>
                    <p className="text-sm text-muted-foreground">
                      {count} center{count === 1 ? '' : 's'} identified as {level}.
                    </p>
                  </div>
                </div>
              ))
        ) : (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Risk Data</AlertTitle>
                <AlertDescription>
                    No risk assessment data is available. Please import data.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}

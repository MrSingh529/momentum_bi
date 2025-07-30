"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface PresalesKpiCardProps {
  title: string;
  icon: React.ReactNode;
  dataFetcher: () => Promise<any[] | null>;
  dataProcessor: (data: any[]) => { value: string; description: string };
  tooltipText?: string;
}

export function PresalesKpiCard({
  title,
  icon,
  dataFetcher,
  dataProcessor,
  tooltipText,
}: PresalesKpiCardProps) {
  const [value, setValue] = useState("0");
  const [description, setDescription] = useState("Loading...");

  useEffect(() => {
    async function fetchData() {
      const data = await dataFetcher();
      if (data && data.length > 0) {
        const { value: newValue, description: newDescription } = dataProcessor(data);
        setValue(newValue);
        setDescription(newDescription);
      } else {
        setValue("0");
        setDescription("No data available");
      }
    }
    fetchData();
  }, [dataFetcher, dataProcessor]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {tooltipText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// Data processing functions for Pre-Sales KPIs

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function excelSerialDateToJSDate(serial: number) {
    // This is a simplified version, assuming dates are after 1900.
    if (typeof serial !== 'number' || isNaN(serial)) {
        return serial; 
    }
    const date = new Date(1900, 0, serial - 1);
    const month = monthOrder[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);

    return `${month}-${year}`;
}

const parseMonth = (monthStr: any) => {
    const displayMonth = typeof monthStr === 'number' && monthStr > 5000 ? excelSerialDateToJSDate(monthStr) : String(monthStr);

    if (typeof displayMonth !== 'string' || !displayMonth.includes('-')) {
        return { year: 0, monthIndex: -1, display: displayMonth };
    }
    const [monthAbbr, yearAbbr] = displayMonth.split('-');
    const year = 2000 + parseInt(yearAbbr, 10);
    const monthIndex = monthOrder.indexOf(monthAbbr);
    return { year, monthIndex, display: displayMonth };
};


const getLatestMonth = (data: any[]) => {
    const months = [...new Set(data.map(item => item.month))].filter(m => m);
    
    if (months.length === 0) return "N/A";

    months.sort((a, b) => {
        const aParsed = parseMonth(a);
        const bParsed = parseMonth(b);
        if (aParsed.year !== bParsed.year) return bParsed.year - aParsed.year;
        return bParsed.monthIndex - aParsed.monthIndex;
    });
    
    const latestMonthRaw = months[0];
    return parseMonth(latestMonthRaw).display;
}


export const processTotalBids = (data: any[]) => {
    const latestMonth = getLatestMonth(data);
    const monthData = data.filter(d => parseMonth(d.month).display === latestMonth);
    const totalBids = monthData.reduce((sum, item) => sum + (parseInt(String(item.bidSubmission || '0'), 10) || 0), 0);
    return {
        value: totalBids.toString(),
        description: `Bids submitted in ${latestMonth}`,
    };
};

export const processWinRate = (data: any[]) => {
    const totalWon = data.reduce((sum, item) => sum + (parseInt(String(item.won || '0'), 10) || 0), 0);
    const totalSubmitted = data.reduce((sum, item) => sum + (parseInt(String(item.bidSubmission || '0'), 10) || 0), 0);
    const winRate = totalSubmitted > 0 ? ((totalWon / totalSubmitted) * 100) : 0;
    return {
        value: `${winRate.toFixed(1)}%`,
        description: `Based on ${totalSubmitted} submitted bids`,
    };
};

export const processTotalWonValue = (data: any[]) => {
    const totalWonValue = data.reduce((sum, item) => sum + (parseFloat(String(item.wonValue).replace(/,/g, '')) || 0), 0);
    return {
        value: `₹${(totalWonValue / 10000000).toFixed(2)} Cr`,
        description: "Total value of all won bids",
    };
};

export const processTechQualificationRate = (data: any[]) => {
    const totalQualified = data.reduce((sum, item) => sum + (parseInt(String(item.techQualifiedBids || '0'), 10) || 0), 0);
    const totalSubmitted = data.reduce((sum, item) => sum + (parseInt(String(item.bidSubmission || '0'), 10) || 0), 0);
    const rate = totalSubmitted > 0 ? (totalQualified / totalSubmitted) * 100 : 0;
    return {
        value: `${rate.toFixed(1)}%`,
        description: `Of ${totalSubmitted} submitted bids`,
    };
};

export const processGoNoGoRatio = (data: any[]) => {
    const totalGo = data.reduce((sum, item) => sum + (parseInt(String(item.go || '0'), 10) || 0), 0);
    const totalEvaluated = data.reduce((sum, item) => sum + (parseInt(String(item['goNoGo'] || '0'), 10) || 0), 0);
    const goRate = totalEvaluated > 0 ? (totalGo / totalEvaluated) * 100 : 0;

    return {
        value: `${goRate.toFixed(1)}%`,
        description: `${totalGo} GO from ${totalEvaluated} decisions`,
    }
}

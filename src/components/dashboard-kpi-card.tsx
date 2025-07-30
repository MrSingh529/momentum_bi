"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCallsData, getInventoryData } from "@/app/actions/upload";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface DashboardKpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  dataFetcher?: () => Promise<any>; // Optional data fetcher
  dataProcessor?: (data: any) => { value: string; description: string }; // Optional data processor
  tooltipText?: string;
}

export function DashboardKpiCard({
  title,
  value: initialValue,
  icon,
  description: initialDescription,
  dataFetcher,
  dataProcessor,
  tooltipText,
}: DashboardKpiCardProps) {
  const [value, setValue] = useState(initialValue);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    async function fetchData() {
      if (dataFetcher && dataProcessor) {
        const data = await dataFetcher();
        if (data && data.length > 0) {
          const { value: newValue, description: newDescription } = dataProcessor(data);
          setValue(newValue);
          setDescription(newDescription);
        }
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
        {description && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

const getLatestMonth = (data: any[]) => {
    // A more robust way to get the latest month
    const months = [...new Set(data.map(item => item.month))];
    if (months.includes("July")) return "July";
    if (months.includes("June")) return "June";
    if (months.includes("May")) return "May";
    return months[months.length -1];
}

// Data processing functions for KPIs
export const processTotalServiceCenters = (data: any[]) => {
    const latestMonth = getLatestMonth(data);
    const uniqueCenters = new Set(data.filter(d => d.month === latestMonth).map(item => item.center));
    return {
      value: uniqueCenters.size.toString(),
      description: `For the month of ${latestMonth}`,
    };
  };

export const processActiveServiceCenters = (data: any[]) => {
    const latestMonth = getLatestMonth(data);
    const monthData = data.filter(d => d.month === latestMonth);
    const activeCenters = monthData.filter(item => item.status === 'Active').length;
    const totalCenters = new Set(monthData.map(item => item.center)).size;
    const percentage = totalCenters > 0 ? ((activeCenters / totalCenters) * 100).toFixed(0) : 0;
    return {
      value: activeCenters.toString(),
      description: `${percentage}% of total for ${latestMonth}`,
    };
  };

  export const processTotalCalls = (data: any[]) => {
    const latestMonth = getLatestMonth(data);
    const monthData = data.filter(d => d.month === latestMonth);
    const totalCalls = monthData.reduce((sum, item) => sum + item.totalCalls, 0);
    return {
      value: totalCalls.toLocaleString(),
      description: `For the month of ${latestMonth}`,
    };
  };

  export const processCancelledCalls = (data: any[]) => {
    const latestMonth = getLatestMonth(data);
    const monthData = data.filter(d => d.month === latestMonth);
    const totalCalls = monthData.reduce((sum, item) => sum + item.totalCalls, 0);
    const cancelledCalls = monthData.reduce((sum, item) => sum + item.cancelledCalls, 0);
    const percentage = totalCalls > 0 ? ((cancelledCalls / totalCalls) * 100).toFixed(1) : 0;
    return {
      value: cancelledCalls.toLocaleString(),
      description: `${percentage}% of total for ${latestMonth}`,
    };
  };

  export const processInventoryValue = (data: any[]) => {
    const latestMonth = getLatestMonth(data);
    const monthData = data.filter(d => d.month === latestMonth);
    const totalValue = monthData.reduce((sum, item) => {
        const available = parseFloat(String(item.available).replace(/,/g, '')) || 0;
        const occupied = parseFloat(String(item.occupied).replace(/,/g, '')) || 0;
        const inTransit = parseFloat(String(item.inTransit).replace(/,/g, '')) || 0;
        return sum + available + occupied + inTransit;
    }, 0);
    return {
      value: totalValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }),
      description: `Across all centers for ${latestMonth}`,
    };
  };

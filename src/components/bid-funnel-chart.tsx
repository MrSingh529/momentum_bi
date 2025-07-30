"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartConfig
  } from "@/components/ui/chart";
import { getBidsData } from "@/app/actions/upload";
import { useEffect, useState } from "react";

const chartConfig = {
    ms: {
      label: "MS",
      color: "hsl(var(--chart-1))",
    },
    rr: {
      label: "R&R",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const parseMonth = (monthStr: any) => {
      if (typeof monthStr === 'number') {
          const date = new Date(1900, 0, monthStr - 1);
          const month = monthOrder[date.getMonth()];
          const year = String(date.getFullYear()).slice(-2);
          const displayMonth = `${month}-${year}`;
          const monthIndex = date.getMonth();
          const yearNum = date.getFullYear();
          return { year: yearNum, monthIndex, display: displayMonth };
      }
      
      if (typeof monthStr !== 'string' || !monthStr.includes('-')) {
          return { year: 0, monthIndex: 0, display: monthStr };
      }
      const [monthAbbr, yearAbbr] = monthStr.split('-');
      const year = 2000 + parseInt(yearAbbr, 10);
      const monthIndex = monthOrder.indexOf(monthAbbr);
      return { year, monthIndex, display: monthStr };
  };

export function BidFunnelChart() {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
          const data = await getBidsData();
          if (data && data.length > 0) {
            const monthlyData = data.reduce((acc, row) => {
                const month = parseMonth(row.month).display;
                if (!month) return acc;
                if (!acc[month]) {
                    acc[month] = { month, ms: 0, rr: 0 };
                }
                acc[month].ms += parseInt(String(row.ms || '0')) || 0;
                acc[month].rr += parseInt(String(row.rr || '0')) || 0;
                return acc;
            }, {});
            
            const sortedData = Object.values(monthlyData)
            .filter((d: any) => d.month) 
            .sort((a: any, b: any) => {
                const aParsed = parseMonth(a.month);
                const bParsed = parseMonth(b.month);
                if (aParsed.year !== bParsed.year) return aParsed.year - bParsed.year;
                return aParsed.monthIndex - bParsed.monthIndex;
            });

            setChartData(sortedData);
          }
        }
        fetchData();
    }, []);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>MS vs R&R Bids Analysis</CardTitle>
        <CardDescription>Monthly comparison of bids for Managed Services and Repair & Refurbishment</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="ms" stroke="var(--color-ms)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="rr" stroke="var(--color-rr)" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

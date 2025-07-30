"use client";

import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const chartConfig = {
  techQualified: {
    label: "Tech Qualified %",
    color: "hsl(var(--chart-1))",
  },
  finQualified: {
    label: "Fin Qualified %",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function excelSerialDateToJSDate(serial: number) {
    if (typeof serial !== 'number' || isNaN(serial)) {
        return serial;
    }
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date_info.getUTCMonth()];
    const year = String(date_info.getUTCFullYear()).slice(-2);

    return `${month}-${year}`;
}

const parseMonth = (monthStr: any) => {
    const displayMonth = typeof monthStr === 'number' ? excelSerialDateToJSDate(monthStr) : String(monthStr);

    if (typeof displayMonth !== 'string' || !displayMonth.includes('-')) {
        return { year: 0, monthIndex: 0, display: displayMonth };
    }
    const [monthAbbr, yearAbbr] = displayMonth.split('-');
    const year = 2000 + parseInt(yearAbbr, 10);
    const monthIndex = monthOrder.indexOf(monthAbbr);
    return { year, monthIndex, display: displayMonth };
};

const parsePercentage = (value: any) => {
    if (typeof value === 'number') {
        return value * 100;
    }
    if (typeof value === 'string') {
        return parseFloat(value.replace('%', '')) || 0;
    }
    return 0;
}


export function QualificationRateChart() {
    const [chartData, setChartData] = useState<any[]>([]);
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');


    useEffect(() => {
        async function fetchData() {
          const data = await getBidsData();
          if (data && data.length > 0) {
            const monthlyData = data.reduce((acc, row) => {
                const month = parseMonth(row.month).display;
                if (!month) return acc;
                if (!acc[month]) {
                    acc[month] = { 
                        month, 
                        techQualified: parsePercentage(row.techQualifiedPercent), 
                        finQualified: parsePercentage(row.finQualifiedPercent) 
                    };
                } else {
                    // This assumes one entry per month, if not, logic to average or sum would be needed
                    acc[month].techQualified = parsePercentage(row.techQualifiedPercent);
                    acc[month].finQualified = parsePercentage(row.finQualifiedPercent);
                }
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
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
            <CardTitle>Qualification Rate Trends</CardTitle>
            <CardDescription>Technical vs. Financial Qualification Rates Over Time</CardDescription>
        </div>
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'line' | 'bar')}>
            <TabsList>
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                     <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line type="monotone" dataKey="techQualified" stroke="var(--color-techQualified)" strokeWidth={2} dot={false} name="Tech Qualified %" />
                        <Line type="monotone" dataKey="finQualified" stroke="var(--color-finQualified)" strokeWidth={2} dot={false} name="Fin Qualified %" />
                    </LineChart>
                ) : (
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="techQualified" fill="var(--color-techQualified)" radius={4} name="Tech Qualified %" />
                        <Bar dataKey="finQualified" fill="var(--color-finQualified)" radius={4} name="Fin Qualified %" />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

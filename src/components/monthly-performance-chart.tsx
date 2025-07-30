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
  submitted: {
    label: "Submitted",
    color: "hsl(var(--chart-1))",
  },
  won: {
    label: "Won",
    color: "hsl(var(--chart-2))",
  },
  lost: {
    label: "Lost",
    color: "hsl(var(--destructive))",
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

    const fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;
    
    const date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);

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


export function MonthlyPerformanceChart() {
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
          const data = await getBidsData();
          if (data && data.length > 0) {
            const monthlyData = data.reduce((acc, row) => {
                const month = parseMonth(row.month).display;
                if (!month) return acc;
                if (!acc[month]) {
                    acc[month] = { month, submitted: 0, won: 0, lost: 0 };
                }
                acc[month].submitted += row.bidSubmission || 0;
                acc[month].won += row.won || 0;
                acc[month].lost += row.lost || 0;
                return acc;
            }, {});
            
            const sortedData = Object.values(monthlyData)
            .filter((d: any) => d.month) // Filter out entries with no month
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
        <CardTitle>Monthly Bid Performance</CardTitle>
        <CardDescription>Submitted vs. Won vs. Lost Bids Over Time</CardDescription>
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
                    <Line type="monotone" dataKey="submitted" stroke="var(--color-submitted)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="won" stroke="var(--color-won)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="lost" stroke="var(--color-lost)" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

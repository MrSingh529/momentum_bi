"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
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
  ChartConfig
} from "@/components/ui/chart";
import { getCallsData } from "@/app/actions/upload";
import { useEffect, useState } from "react";

const defaultChartData = [
    // This will be replaced by fetched data
];

const chartConfig = {
  calls: {
    label: "Total Calls",
    color: "hsl(var(--chart-1))",
  },
  cancellations: {
    label: "Cancelled",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function CallPerformanceChart() {
    const [chartData, setChartData] = useState(defaultChartData);
    const [latestMonth, setLatestMonth] = useState("");

    useEffect(() => {
        async function fetchData() {
          const data = await getCallsData();
          if (data && data.length > 0) {
            const months = [...new Set(data.map((item: any) => item.month))];
            let lastMonth = months[months.length - 1];
            if (months.includes("July")) lastMonth = "July";
            else if (months.includes("June")) lastMonth = "June";
            else if (months.includes("May")) lastMonth = "May";
            
            setLatestMonth(lastMonth);
            
            const filteredData = data.filter((item: any) => item.month === lastMonth);

            const formattedData = filteredData.map((item: any) => ({
                serviceCenter: item.center.split(" ")[0], // Use a shorter name for the chart
                calls: item.totalCalls,
                cancellations: item.cancelledCalls,
            }));
            setChartData(formattedData);
          }
        }
        fetchData();
      }, []);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Call Performance by Service Center</CardTitle>
        <CardDescription>Month of {latestMonth}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="serviceCenter"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 12)}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="calls" fill="var(--color-calls)" radius={4} />
              <Bar dataKey="cancellations" fill="var(--color-cancellations)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

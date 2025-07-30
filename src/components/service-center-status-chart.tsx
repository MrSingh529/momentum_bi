"use client";

import * as React from "react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

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
  ChartConfig,
} from "@/components/ui/chart";
import { getCallsData } from "@/app/actions/upload";
import { useEffect, useState } from "react";

const defaultChartData = [
    // This will be replaced by fetched data
];

const chartConfig = {
  count: {
    label: "Count",
  },
  active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  closed: {
    label: "Closed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ServiceCenterStatusChart() {
    const [chartData, setChartData] = useState(defaultChartData);

    useEffect(() => {
        async function fetchData() {
          const data = await getCallsData();
          if (data) {
            const months = [...new Set(data.map((item: any) => item.month))];
            let lastMonth = months[months.length - 1];
            if (months.includes("July")) lastMonth = "July";
            else if (months.includes("June")) lastMonth = "June";
            else if (months.includes("May")) lastMonth = "May";
            
            const latestData = data.filter((d: any) => d.month === lastMonth);
            const activeCount = latestData.filter((item: any) => item.status === 'Active').length;
            const closedCount = latestData.filter((item: any) => item.status === 'Closed').length;
            setChartData([
                { status: "Active", count: activeCount, fill: "var(--color-active)" },
                { status: "Closed", count: closedCount, fill: "var(--color-closed)" },
            ]);
          }
        }
        fetchData();
      }, []);

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="items-center pb-0">
        <CardTitle>Service Center Status</CardTitle>
        <CardDescription>Current operational status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                strokeWidth={5}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

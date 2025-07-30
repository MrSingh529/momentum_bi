import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BarChart, Briefcase, Filter, TrendingUp, GitMerge, ListTodo, HelpCircle } from "lucide-react";
import Link from "next/link";
import { BidsTable } from "@/components/bids-table";
import { PresalesKpiCard, processTotalBids, processWinRate, processTotalWonValue, processTechQualificationRate, processGoNoGoRatio } from "@/components/presales-kpi-card";
import { BidFunnelChart } from "@/components/bid-funnel-chart";
import { MonthlyPerformanceChart } from "@/components/monthly-performance-chart";
import { getBidsData } from "@/app/actions/upload";
import { QualificationRateChart } from "@/components/qualification-rate-chart";

export default function PreSalesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Pre-Sales Bid Analysis</h1>
          <p className="text-muted-foreground mt-2">Track and evaluate bidding and tender performance.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/dashboard/presales/ask-ai">
                    <HelpCircle className="mr-2 h-4 w-4" /> Ask Questions
                </Link>
            </Button>
            <Button asChild>
                <Link href="/dashboard/presales/month-wise-trends">
                    <ListTodo className="mr-2 h-4 w-4" /> Month-wise Trends
                </Link>
            </Button>
            <Button asChild>
            <Link href="/dashboard/presales/import">
                <Upload className="mr-2 h-4 w-4" /> Import Data
            </Link>
            </Button>
        </div>
      </div>

       {/* KPI Section */}
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <PresalesKpiCard
          title="Total Bids Submitted"
          icon={<Briefcase className="h-5 w-5" />}
          dataFetcher={getBidsData}
          dataProcessor={processTotalBids}
          tooltipText="Total number of bids in the 'Bid submission' column for the latest imported month."
        />
        <PresalesKpiCard
          title="Overall Win Rate"
          icon={<TrendingUp className="h-5 w-5" />}
          dataFetcher={getBidsData}
          dataProcessor={processWinRate}
          tooltipText="Calculated as (Total Won / (Total Won + Total Lost)) across all data."
        />
        <PresalesKpiCard
          title="Total Won Value"
          icon={<BarChart className="h-5 w-5" />}
          dataFetcher={getBidsData}
          dataProcessor={processTotalWonValue}
          tooltipText="Sum of the 'WON Value' column across all data."
        />
        <PresalesKpiCard
          title="Tech. Qualification Rate"
          icon={<Filter className="h-5 w-5" />}
          dataFetcher={getBidsData}
          dataProcessor={processTechQualificationRate}
          tooltipText="Calculated as (Total Tech Qualified bids / Total Bid Submissions) across all data."
        />
        <PresalesKpiCard
          title="Go-NoGo Ratio"
          icon={<GitMerge className="h-5 w-5" />}
          dataFetcher={getBidsData}
          dataProcessor={processGoNoGoRatio}
          tooltipText="The percentage of bids approved to move forward. Calculated as (Total GO / Total Go/No-GO) across all data."
        />
      </div>

      {/* Visual Analytics Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BidFunnelChart />
        </div>
        <div className="lg:col-span-2">
          <MonthlyPerformanceChart />
        </div>
         <div className="lg:col-span-3">
          <QualificationRateChart />
        </div>
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-1">
        <BidsTable />
      </div>
    </div>
  );
}

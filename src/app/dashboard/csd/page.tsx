import Link from "next/link";
import {
  Building,
  Phone,
  PhoneOff,
  Wallet,
  Activity,
  Upload,
  HelpCircle,
} from "lucide-react";
import { DashboardKpiCard, processTotalServiceCenters, processActiveServiceCenters, processTotalCalls, processCancelledCalls, processInventoryValue } from "@/components/dashboard-kpi-card";
import { CallPerformanceChart } from "@/components/call-performance-chart";
import { ServiceCenterStatusChart } from "@/components/service-center-status-chart";
import { CallsTable } from "@/components/calls-table";
import { InventoryTable } from "@/components/inventory-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { getCallsData, getInventoryData } from "@/app/actions/upload";
import { RiskAssessmentCard } from "@/components/risk-assessment-card";

export default function CSDDashboardPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <DashboardKpiCard
          title="Total Service Centers"
          value="0"
          icon={<Building className="h-5 w-5" />}
          description="From the provided data"
          dataFetcher={getCallsData}
          dataProcessor={processTotalServiceCenters}
          tooltipText="Total count of unique service centers for the latest imported month."
        />
        <DashboardKpiCard
          title="Active Service Centers"
          value="0"
          icon={<Activity className="h-5 w-5" />}
          description="0% of total"
          dataFetcher={getCallsData}
          dataProcessor={processActiveServiceCenters}
          tooltipText="Count of service centers with 'Active' status for the latest imported month."
        />
        <DashboardKpiCard
          title="Total Calls"
          value="0"
          icon={<Phone className="h-5 w-5" />}
          description="Sum of all calls"
          dataFetcher={getCallsData}
          dataProcessor={processTotalCalls}
          tooltipText="Sum of 'Total Calls' for all service centers in the latest imported month."
        />
        <DashboardKpiCard
          title="Total Cancelled Calls"
          value="0"
          icon={<PhoneOff className="h-5 w-5" />}
          description="0% of total calls"
          dataFetcher={getCallsData}
          dataProcessor={processCancelledCalls}
          tooltipText="Sum of 'Cancelled Calls' for all service centers in the latest imported month."
        />
        <DashboardKpiCard
          title="Total Inventory Value"
          value="₹0"
          icon={<Wallet className="h-5 w-5" />}
          description="Across all centers"
          dataFetcher={getInventoryData}
          dataProcessor={processInventoryValue}
          tooltipText="Sum of 'Available', 'Occupied', and 'In-Transit' inventory value across all centers for the latest month."
        />
      </div>

      {/* Visual Analytics Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CallPerformanceChart />
        </div>
        <div className="lg:col-span-1">
          <ServiceCenterStatusChart />
        </div>
        <div className="lg:col-span-1">
          <RiskAssessmentCard />
        </div>
      </div>

       <div className="flex justify-end gap-2">
        <Button asChild>
            <Link href="/dashboard/csd/ask-ai">
                <HelpCircle className="mr-2 h-4 w-4" /> Ask AI
            </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/trends">AI Trend Analysis</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/month-wise-trends">Month-wise Trends</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/import">
            <Upload className="mr-2 h-4 w-4" /> Import Data
          </Link>
        </Button>
      </div>

      {/* Detailed Operations Tables Section */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-1">
        <CallsTable />
        <InventoryTable />
      </div>
    </div>
  );
}

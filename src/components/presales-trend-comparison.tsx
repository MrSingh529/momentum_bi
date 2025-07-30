"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { getBidsData } from "@/app/actions/upload";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortDescriptor = {
    column: string;
    direction: 'ascending' | 'descending';
}

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

export function PresalesTrendComparison() {
  const [months, setMonths] = useState<string[]>([]);
  const [bidsData, setBidsData] = useState<any[]>([]);
  const [selectedMonth1, setSelectedMonth1] = useState<string>("");
  const [selectedMonth2, setSelectedMonth2] = useState<string>("");
  const [selectedMonth3, setSelectedMonth3] = useState<string>("");
  const [activeTab, setActiveTab] = useState("bidSubmission");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'month', direction: 'ascending'});

  useEffect(() => {
    async function loadData() {
      const data = await getBidsData();
      if (data && data.length > 0) {
        setBidsData(data);
        const uniqueMonths = [...new Set(data.map((b: any) => parseMonth(b.month).display))].sort((a,b) => {
            const aParsed = parseMonth(a);
            const bParsed = parseMonth(b);
            if(aParsed.year !== bParsed.year) return aParsed.year - bParsed.year;
            return aParsed.monthIndex - bParsed.monthIndex;
        });
        setMonths(uniqueMonths);

        if (uniqueMonths.length >= 3) {
            setSelectedMonth1(uniqueMonths[0]);
            setSelectedMonth2(uniqueMonths[1]);
            setSelectedMonth3(uniqueMonths[2]);
        } else if (uniqueMonths.length === 2) {
            setSelectedMonth1(uniqueMonths[0]);
            setSelectedMonth2(uniqueMonths[1]);
        } else if (uniqueMonths.length === 1) {
            setSelectedMonth1(uniqueMonths[0]);
        }
      }
    }
    loadData();
  }, []);

  const comparisonData = useMemo(() => {
    const selectedMonths = [selectedMonth1, selectedMonth2, selectedMonth3].filter(Boolean);
    if (selectedMonths.length < 2) return [];

    const key = activeTab;

    const data = selectedMonths.map(month => {
        const monthData = bidsData.find(d => parseMonth(d.month).display === month);
        return {
            month: month,
            value: monthData ? (parseInt(String(monthData[key] || '0')) || 0) : 0,
        };
    });

    const rows = [
        {
            metric: "Value",
            month1Value: data[0]?.value.toLocaleString() ?? "N/A",
            month2Value: data[1]?.value.toLocaleString() ?? "N/A",
            month3Value: data[2]?.value.toLocaleString() ?? "N/A",
            change1: (data[1]?.value ?? 0) - (data[0]?.value ?? 0),
            change2: (data[2]?.value ?? 0) - (data[1]?.value ?? 0),
        }
    ];

    return rows;
  }, [selectedMonth1, selectedMonth2, selectedMonth3, activeTab, bidsData]);

  const getChangeCell = (change: number) => {
    let className = "";
    let icon = null;
  
    if (change > 0) {
      className = "text-green-600";
      icon = <ArrowUp className="h-4 w-4 inline-block" />;
    } else if (change < 0) {
      className = "text-red-500";
      icon = <ArrowDown className="h-4 w-4 inline-block" />;
    }
  
    return (
      <span className={className}>
        {change !== 0 && icon} {change.toLocaleString()}
      </span>
    );
  };

  const availableMonthsForM1 = months.filter(m => m !== selectedMonth2 && m !== selectedMonth3);
  const availableMonthsForM2 = months.filter(m => m !== selectedMonth1 && m !== selectedMonth3);
  const availableMonthsForM3 = months.filter(m => m !== selectedMonth1 && m !== selectedMonth2);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Pre-Sales: Month-wise Trend Comparison</CardTitle>
        <CardDescription>
          Compare key bid metrics between two or three selected months.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month1">Month 1</Label>
            <Select value={selectedMonth1} onValueChange={setSelectedMonth1}>
              <SelectTrigger id="month1"><SelectValue placeholder="Select month" /></SelectTrigger>
              <SelectContent>{availableMonthsForM1.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="month2">Month 2</Label>
            <Select value={selectedMonth2} onValueChange={setSelectedMonth2}>
              <SelectTrigger id="month2"><SelectValue placeholder="Select month" /></SelectTrigger>
              <SelectContent>{availableMonthsForM2.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="month3">Month 3 (Optional)</Label>
            <Select value={selectedMonth3} onValueChange={(v) => setSelectedMonth3(v === "none" ? "" : v)}>
              <SelectTrigger id="month3"><SelectValue placeholder="Select month" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableMonthsForM3.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="bidSubmission">Bids Submitted</TabsTrigger>
            <TabsTrigger value="won">Bids Won</TabsTrigger>
            <TabsTrigger value="lost">Bids Lost</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>{selectedMonth1 || "Month 1"}</TableHead>
                    <TableHead>{selectedMonth2 || "Month 2"}</TableHead>
                    <TableHead>Change (M2-M1)</TableHead>
                    {selectedMonth3 && <TableHead>{selectedMonth3}</TableHead>}
                    {selectedMonth3 && <TableHead>Change (M3-M2)</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {comparisonData.map(row => (
                        <TableRow key={row.metric}>
                            <TableCell className="font-medium capitalize">{activeTab.replace(/([A-Z])/g, ' $1')}</TableCell>
                            <TableCell>{row.month1Value}</TableCell>
                            <TableCell>{row.month2Value}</TableCell>
                            <TableCell>{getChangeCell(row.change1)}</TableCell>
                            {selectedMonth3 && <TableCell>{row.month3Value}</TableCell>}
                            {selectedMonth3 && <TableCell>{getChangeCell(row.change2)}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

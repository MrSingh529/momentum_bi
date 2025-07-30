"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getCallsData } from "@/app/actions/upload";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";
import * as xlsx from "xlsx";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';


export function CallsTable() {
  const [callsData, setCallsData] = useState<any[]>([]);
  const [latestMonth, setLatestMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getCallsData();
      if (data && data.length > 0) {
        const months = [...new Set(data.map((item: any) => item.month))];
        let lastMonth = months[months.length - 1];
        if (months.includes("July")) lastMonth = "July";
        else if (months.includes("June")) lastMonth = "June";
        else if (months.includes("May")) lastMonth = "May";

        setLatestMonth(lastMonth);
        setCallsData(data.filter((item: any) => item.month === lastMonth));
      } else {
        setCallsData([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const getBadgeVariant = (risk: string) => {
    switch (risk) {
      case "No Risk":
        return "default";
      case "High Risk":
        return "secondary";
      case "Top High Risk":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!callsData.length) return;
  
    const dataToExport = callsData.map(call => ({
      'SC Name': call.center,
      'SC Code': call.scCode,
      'Risk': call.risk,
      'Status': call.status,
      'Total Calls': call.totalCalls,
      'Cancelled Calls': call.cancelledCalls
    }));
  
    if (format === 'excel') {
      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Calls Data');
      xlsx.writeFile(workbook, `Calls_Overview_${latestMonth}.xlsx`);
    } else if (format === 'csv') {
      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const csvOutput = xlsx.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Calls_Overview_${latestMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Calls Overview - ${latestMonth}`, 14, 15);
      autoTable(doc, {
        head: [['SC Name', 'SC Code', 'Risk', 'Status', 'Total Calls', 'Cancelled Calls']],
        body: dataToExport.map(Object.values),
        startY: 20,
      });
      doc.save(`Calls_Overview_${latestMonth}.pdf`);
    }
  };
  

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calls Overview</CardTitle>
            <CardDescription>
              {latestMonth ? `Call data for all service centers for ${latestMonth}.` : 'No data available. Please import data.'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading || callsData.length === 0}>
                  <FileDown className="h-4 w-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport('excel')}>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading data...</p>
        ) : callsData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SC Name</TableHead>
                <TableHead>SC Code</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Calls</TableHead>
                <TableHead>Cancelled Calls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callsData.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">{call.center}</TableCell>
                  <TableCell>{call.scCode}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(call.risk)}>{call.risk}</Badge>
                  </TableCell>
                  <TableCell>{call.status}</TableCell>
                  <TableCell>{call.totalCalls}</TableCell>
                  <TableCell>{call.cancelledCalls}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Data Found</AlertTitle>
            <AlertDescription>
              The database is currently empty. Please import an Excel file to populate the dashboard.
               <Button variant="link" asChild className="p-1 h-auto">
                 <Link href="/dashboard/import">Go to Import Page</Link>
               </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

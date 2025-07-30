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
import { FileDown, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getBidsData } from "@/app/actions/upload";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";
import * as xlsx from "xlsx";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

const columnOrder: { key: string; label: string }[] = [
    { key: "month", label: "Month" },
    { key: "noOfBid", label: "No. Of Bid" },
    { key: "goNoGo", label: "Go/No-GO" },
    { key: "go", label: "GO" },
    { key: "noGo", label: "NO GO" },
    { key: "pqtqStage", label: "PQ/TQ Stage(Bid Preparation)" },
    { key: "commercialFinalization", label: "Commercial finalization stage" },
    { key: "bidSubmission", label: "Bid submission" },
    { key: "pqtqEvaluation", label: "PQ/TQ evaluation" },
    { key: "financialEvaluation", label: "Financial evaluation" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" },
    { key: "cancelled", label: "Cancelled" },
    { key: "dropped", label: "Dropped" },
    { key: "techQualifiedPercent", label: "Tech Qualified %" },
    { key: "techQualifiedBids", label: "Tech Qualified bids" },
    { key: "finQualifiedPercent", label: "Fin Qualified %" },
    { key: "finQualifiedBids", label: "Fin Qualified bids" },
    { key: "quotedPrice", label: "Quoted Price" },
    { key: "openProspects", label: "Open Prospects" },
    { key: "wonValue", label: "WON Value" },
    { key: "lostValue", label: "LOST Value" },
    { key: "poValue", label: "PO value" },
    { key: "rr", label: "R&R" },
    { key: "ms", label: "MS" },
  ];
  

export function BidsTable() {
  const [bidsData, setBidsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getBidsData();
      if (data && data.length > 0) {
        setBidsData(data);
      } else {
        setBidsData([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!bidsData.length) return;
  
    const dataToExport = bidsData.map(bid => {
        const orderedBid: {[key: string]: any} = {};
        columnOrder.forEach(col => {
            orderedBid[col.label] = bid[col.key];
        });
        return orderedBid;
    });
  
    if (format === 'excel') {
      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Bids Data');
      xlsx.writeFile(workbook, `Bids_Overview.xlsx`);
    } else if (format === 'csv') {
      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const csvOutput = xlsx.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Bids_Overview.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.text(`Bids Overview`, 14, 15);
      autoTable(doc, {
        head: [Object.keys(dataToExport[0])],
        body: dataToExport.map(Object.values),
        startY: 20,
        styles: { fontSize: 5 },
        headStyles: { fontSize: 6 },
      });
      doc.save(`Bids_Overview.pdf`);
    }
  };
  

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bids Overview</CardTitle>
            <CardDescription>
              {bidsData.length > 0 ? `Showing all imported bid data.` : 'No data available. Please import data.'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading || bidsData.length === 0}>
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
        ) : bidsData.length > 0 ? (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columnOrder.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidsData.map((bid) => (
                <TableRow key={bid.id}>
                    {columnOrder.map(col => (
                         <TableCell key={col.key} className="font-medium whitespace-nowrap">{String(bid[col.key] ?? '')}</TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Data Found</AlertTitle>
            <AlertDescription>
              The database is currently empty. Please import an Excel file to populate the dashboard.
               <Button variant="link" asChild className="p-1 h-auto">
                 <Link href="/dashboard/presales/import">Go to Import Page</Link>
               </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

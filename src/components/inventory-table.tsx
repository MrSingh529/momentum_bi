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
import { FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { getInventoryData } from "@/app/actions/upload";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";
import Link from "next/link";
import * as xlsx from "xlsx";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export function InventoryTable() {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [latestMonth, setLatestMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getInventoryData();
      if (data && data.length > 0) {
        const months = [...new Set(data.map((item: any) => item.month))];
        let lastMonth = months[months.length - 1];
        if (months.includes("July")) lastMonth = "July";
        else if (months.includes("June")) lastMonth = "June";
        else if (months.includes("May")) lastMonth = "May";

        setLatestMonth(lastMonth);
        setInventoryData(data.filter((item: any) => item.month === lastMonth));
      } else {
        setInventoryData([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!inventoryData.length) return;

    const dataToExport = inventoryData.map(item => ({
      'Service Center': item.center,
      'Avg. Consumption': item.consumption,
      'Available Value': item.available,
      'Occupied Value': item.occupied,
      'Under Transit Value': item.inTransit,
    }));

    if (format === 'excel') {
      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Inventory Data');
      xlsx.writeFile(workbook, `Inventory_Overview_${latestMonth}.xlsx`);
    } else if (format === 'csv') {
      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const csvOutput = xlsx.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Inventory_Overview_${latestMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Inventory Overview - ${latestMonth}`, 14, 15);
      autoTable(doc, {
        head: [['Service Center', 'Avg. Consumption', 'Available Value', 'Occupied Value', 'Under Transit Value']],
        body: dataToExport.map(Object.values),
        startY: 20,
      });
      doc.save(`Inventory_Overview_${latestMonth}.pdf`);
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
                {latestMonth ? `Current inventory status for ${latestMonth}.` : 'No data available. Please import data.'}
            </CardDescription>
          </div>
           <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading || inventoryData.length === 0}>
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
        ) : inventoryData.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Center</TableHead>
              <TableHead>Avg. Consumption</TableHead>
              <TableHead>Available Value</TableHead>
              <TableHead>Occupied Value</TableHead>
              <TableHead>Under Transit Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.center}</TableCell>
                <TableCell>{item.consumption}</TableCell>
                <TableCell>{item.available}</TableCell>
                <TableCell>{item.occupied}</TableCell>
                <TableCell>{item.inTransit}</TableCell>
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

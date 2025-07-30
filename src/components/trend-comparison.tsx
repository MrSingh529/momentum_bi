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
import { getCallsData, getInventoryData } from "@/app/actions/upload";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";


type SortDescriptor = {
    column: string;
    direction: 'ascending' | 'descending';
}

export function TrendComparison() {
  const [months, setMonths] = useState<string[]>([]);
  const [allScNames, setAllScNames] = useState<string[]>([]);
  const [allStatuses, setAllStatuses] = useState<string[]>([]);
  const [selectedMonth1, setSelectedMonth1] = useState<string>("");
  const [selectedMonth2, setSelectedMonth2] = useState<string>("");
  const [selectedMonth3, setSelectedMonth3] = useState<string>("");
  const [selectedScNames, setSelectedScNames] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [callsData, setCallsData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("totalCalls");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'scName', direction: 'ascending'});

  useEffect(() => {
    async function loadData() {
      const calls = await getCallsData();
      const inventory = await getInventoryData();
      if (calls && calls.length > 0) {
        setCallsData(calls);
        const uniqueMonths = [
          ...new Set(calls.map((c: any) => c.month)),
        ].sort();
        setMonths(uniqueMonths as string[]);

        const uniqueScNames = [...new Set(calls.map((c: any) => c.center))].sort();
        setAllScNames(uniqueScNames as string[]);
        setSelectedScNames(uniqueScNames as string[]);
        
        const uniqueStatuses = [...new Set(calls.map((c: any) => c.status))].sort();
        setAllStatuses(uniqueStatuses as string[]);
        setSelectedStatuses(uniqueStatuses as string[]);


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
      if (inventory && inventory.length > 0) {
        setInventoryData(inventory);
      }
    }
    loadData();
  }, []);

  const comparisonData = useMemo(() => {
    let data1: any[], data2: any[], data3: any[];
    let key: string;

    const filteredCallsDataByStatus = callsData.filter(d => selectedStatuses.includes(d.status));

    switch (activeTab) {
      case "totalCalls":
        data1 = filteredCallsDataByStatus.filter((d) => d.month === selectedMonth1);
        data2 = filteredCallsDataByStatus.filter((d) => d.month === selectedMonth2);
        data3 = filteredCallsDataByStatus.filter((d) => d.month === selectedMonth3);
        key = "totalCalls";
        break;
      case "cancelledCalls":
        data1 = filteredCallsDataByStatus.filter((d) => d.month === selectedMonth1);
        data2 = filteredCallsDataByStatus.filter((d) => d.month === selectedMonth2);
        data3 = filteredCallsDataByStatus.filter((d) => d.month === selectedMonth3);
        key = "cancelledCalls";
        break;
      case "inventoryConsumption":
        // Inventory data doesn't have status, so we use service centers from filtered calls
        const scNamesFromFilteredCalls = new Set(filteredCallsDataByStatus.map(c => c.center));
        const filteredInventoryData = inventoryData.filter(d => scNamesFromFilteredCalls.has(d.center));

        data1 = filteredInventoryData.filter((d) => d.month === selectedMonth1);
        data2 = filteredInventoryData.filter((d) => d.month === selectedMonth2);
        data3 = filteredInventoryData.filter((d) => d.month === selectedMonth3);
        key = "consumption";
        break;
      default:
        return [];
    }
    
    const scNameToCompare = selectedScNames.length > 0 ? selectedScNames : allScNames;

    return scNameToCompare.map(scName => {
        const d1 = data1.find(d => d.center === scName);
        const d2 = data2.find(d => d.center === scName);
        const d3 = data3.find(d => d.center === scName);
        
        const parseValue = (val: any) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0;
            return 0;
        }

        const v1 = parseValue(d1?.[key]);
        const v2 = parseValue(d2?.[key]);
        const v3 = parseValue(d3?.[key]);

        return {
            scName: scName,
            month1Value: d1 ? (key === 'consumption' ? d1[key] : v1.toLocaleString()) : "N/A",
            month2Value: d2 ? (key === 'consumption' ? d2[key] : v2.toLocaleString()) : "N/A",
            month3Value: d3 ? (key === 'consumption' ? d3[key] : v3.toLocaleString()) : "N/A",
            change1: v2 - v1,
            change2: v3 - v2,
        };
    }).filter(row => {
        // If status filter is applied, only show rows that match the filtered service centers
        if (activeTab === 'inventoryConsumption') {
            const scNamesFromFilteredCalls = new Set(filteredCallsDataByStatus.map(c => c.center));
            return scNamesFromFilteredCalls.has(row.scName);
        }
        return true;
    });

  }, [selectedMonth1, selectedMonth2, selectedMonth3, activeTab, callsData, inventoryData, selectedScNames, allScNames, selectedStatuses]);

  const sortedData = useMemo(() => {
    return [...comparisonData].sort((a, b) => {
        const { column, direction } = sortDescriptor;
        const aVal = a[column as keyof typeof a];
        const bVal = b[column as keyof typeof b];

        if (aVal === bVal) return 0;

        const sortOrder = direction === 'ascending' ? 1 : -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal) * sortOrder;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return (aVal - bVal) * sortOrder;
        }
        return 0;
    });
  }, [comparisonData, sortDescriptor]);

  const onSortChange = (column: string) => {
    if (sortDescriptor.column === column) {
        setSortDescriptor({ column, direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending' });
    } else {
        setSortDescriptor({ column, direction: 'ascending' });
    }
  }

  const getSortIcon = (column: string) => {
    if (sortDescriptor.column !== column) {
        return <ArrowUpDown className="h-4 w-4 inline-block ml-2 opacity-30" />;
    }
    if (sortDescriptor.direction === 'ascending') {
        return <ArrowUp className="h-4 w-4 inline-block ml-2" />;
    }
    return <ArrowDown className="h-4 w-4 inline-block ml-2" />;
  }

  const getChangeCell = (change: number, isCancelledCalls: boolean) => {
    let className = "";
    let icon = null;
  
    // For cancelled calls, a decrease is good (green) and an increase is bad (red)
    if (isCancelledCalls) {
      if (change < 0) {
        className = "text-green-600";
        icon = <ArrowDown className="h-4 w-4 inline-block" />;
      } else if (change > 0) {
        className = "text-red-500";
        icon = <ArrowUp className="h-4 w-4 inline-block" />;
      }
    } else {
    // For other metrics, an increase is good (green) and a decrease is bad (red)
      if (change > 0) {
        className = "text-green-600";
        icon = <ArrowUp className="h-4 w-4 inline-block" />;
      } else if (change < 0) {
        className = "text-red-500";
        icon = <ArrowDown className="h-4 w-4 inline-block" />;
      }
    }
  
    return (
      <span className={className}>
        {change !== 0 && icon} {change.toLocaleString()}
      </span>
    );
  };

  const getMetricLabel = () => {
    switch (activeTab) {
        case "totalCalls": return "Total Calls";
        case "cancelledCalls": return "Cancelled Calls";
        case "inventoryConsumption": return "Avg. Consumption";
        default: return "";
    }
  }

  const availableMonthsForM1 = months.filter(m => m !== selectedMonth2 && m !== selectedMonth3);
  const availableMonthsForM2 = months.filter(m => m !== selectedMonth1 && m !== selectedMonth3);
  const availableMonthsForM3 = months.filter(m => m !== selectedMonth1 && m !== selectedMonth2);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Month-wise Trend Comparison</CardTitle>
        <CardDescription>
          Compare performance metrics between two or three selected months.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month1">Month 1</Label>
            <Select
              value={selectedMonth1}
              onValueChange={setSelectedMonth1}
            >
              <SelectTrigger id="month1">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonthsForM1.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="month2">Month 2</Label>
            <Select
              value={selectedMonth2}
              onValueChange={setSelectedMonth2}
            >
              <SelectTrigger id="month2">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonthsForM2.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="month3">Month 3</Label>
            <Select
              value={selectedMonth3}
              onValueChange={(value) => setSelectedMonth3(value === "none" ? "" : value)}
            >
              <SelectTrigger id="month3">
                <SelectValue placeholder="Select month (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableMonthsForM3.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Service Centers</Label>
                <MultiSelect
                    options={allScNames.map(name => ({ label: name, value: name }))}
                    selected={selectedScNames}
                    onChange={setSelectedScNames}
                    className="w-full"
                    placeholder="Select service centers..."
                />
            </div>
            <div className="space-y-2">
                <Label>Status</Label>
                <MultiSelect
                    options={allStatuses.map(name => ({ label: name, value: name }))}
                    selected={selectedStatuses}
                    onChange={setSelectedStatuses}
                    className="w-full"
                    placeholder="Select statuses..."
                />
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="totalCalls">Total Calls</TabsTrigger>
            <TabsTrigger value="cancelledCalls">Cancelled Calls</TabsTrigger>
            <TabsTrigger value="inventoryConsumption">Inventory</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => onSortChange('scName')}>
                            Service Center {getSortIcon('scName')}
                        </Button>
                    </TableHead>
                    <TableHead>{selectedMonth1 || "Month 1"}</TableHead>
                    <TableHead>{selectedMonth2 || "Month 2"}</TableHead>
                    <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => onSortChange('change1')}>
                            Change (M2-M1) {getSortIcon('change1')}
                        </Button>
                    </TableHead>
                    {selectedMonth3 && <TableHead>{selectedMonth3}</TableHead>}
                    {selectedMonth3 && (
                        <TableHead>
                             <Button variant="ghost" size="sm" onClick={() => onSortChange('change2')}>
                                Change (M3-M2) {getSortIcon('change2')}
                            </Button>
                        </TableHead>
                    )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map(row => (
                        <TableRow key={row.scName}>
                            <TableCell className="font-medium">{row.scName}</TableCell>
                            <TableCell>{row.month1Value}</TableCell>
                            <TableCell>{row.month2Value}</TableCell>
                            <TableCell>{getChangeCell(row.change1, activeTab === 'cancelledCalls')}</TableCell>
                            {selectedMonth3 && <TableCell>{row.month3Value}</TableCell>}
                            {selectedMonth3 && <TableCell>{getChangeCell(row.change2, activeTab === 'cancelledCalls')}</TableCell>}
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

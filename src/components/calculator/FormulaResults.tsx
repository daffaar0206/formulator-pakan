import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Save, RotateCcw } from "lucide-react";

interface FormulaResult {
  ingredient: string;
  percentage: number;
  costPerKg: number;
  totalCost: number;
}

interface FormulaResultsProps {
  results?: FormulaResult[];
  totalCost?: number;
  onSave?: () => void;
  onReset?: () => void;
}

const FormulaResults = ({
  results = [],
  totalCost = 0,
  onSave = () => console.log("Save clicked"),
  onReset = () => {
    localStorage.removeItem("ingredients");
    window.location.reload();
  },
}: FormulaResultsProps) => {
  return (
    <Card className="w-full p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hasil Formulasi</h2>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={onSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Simpan Formula
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[300px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bahan</TableHead>
              <TableHead className="text-right">Persentase (%)</TableHead>
              <TableHead className="text-right">Harga/kg (Rp)</TableHead>
              <TableHead className="text-right">Total Harga (Rp)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.ingredient}>
                <TableCell className="font-medium">
                  {result.ingredient}
                </TableCell>
                <TableCell className="text-right">
                  {result.percentage}
                </TableCell>
                <TableCell className="text-right">
                  {result.costPerKg.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {result.totalCost.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="mt-6 flex justify-end">
        <div className="text-lg font-semibold">
          Total Harga per kg: Rp{totalCost.toLocaleString()}
        </div>
      </div>
    </Card>
  );
};

export default FormulaResults;

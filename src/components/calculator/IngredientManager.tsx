import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Ingredient } from "@/lib/formulationLogic";

interface IngredientManagerProps {
  ingredients: Ingredient[];
  availableIngredients: Ingredient[];
  onAddIngredient: (newIngredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  onEditIngredient: (id: string, updatedIngredient: Ingredient) => void;
  onAddAvailableIngredient: (ingredient: Ingredient) => void;
  onRemoveAvailableIngredient: (id: string) => void;
}

const IngredientManager = ({
  ingredients,
  availableIngredients,
  onAddIngredient,
  onDeleteIngredient,
  onEditIngredient,
  onAddAvailableIngredient,
  onRemoveAvailableIngredient,
}: IngredientManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewIngredientForm, setShowNewIngredientForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    id: "",
    name: "",
    bk: null as unknown as number,
    pk: null as unknown as number,
    lk: null as unknown as number,
    sk: null as unknown as number,
    tdn: null as unknown as number,
    em: null as unknown as number,
    calcium: null as unknown as number,
    pricePerKg: null as unknown as number,
  });

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newIngredient.name) {
      alert("Nama bahan harus diisi");
      return;
    }

    // Validate all required fields are filled
    const requiredFields = ['bk', 'pk', 'lk', 'sk', 'tdn', 'em', 'calcium', 'pricePerKg'];
    const emptyFields = requiredFields.filter(field => 
      newIngredient[field as keyof Ingredient] === null || 
      newIngredient[field as keyof Ingredient] === undefined || 
      newIngredient[field as keyof Ingredient] === ''
    );

    if (emptyFields.length > 0) {
      alert(`Semua nilai nutrisi harus diisi`);
      return;
    }

    onAddIngredient({ 
      ...newIngredient, 
      id: Math.random().toString(36).substr(2, 9),
      // Convert all numbers to fixed precision
      bk: Number(newIngredient.bk),
      pk: Number(newIngredient.pk),
      lk: Number(newIngredient.lk),
      sk: Number(newIngredient.sk),
      tdn: Number(newIngredient.tdn),
      em: Number(newIngredient.em),
      calcium: Number(newIngredient.calcium),
      pricePerKg: Number(newIngredient.pricePerKg),
    });

    // Reset form
    setNewIngredient({
      id: "",
      name: "",
      bk: null as unknown as number,
      pk: null as unknown as number,
      lk: null as unknown as number,
      sk: null as unknown as number,
      tdn: null as unknown as number,
      em: null as unknown as number,
      calcium: null as unknown as number,
      pricePerKg: null as unknown as number,
    });
    setShowNewIngredientForm(false);
  };

  return (
    <Card className="p-4 sm:p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bahan Formulasi</h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Bahan
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Pilih Bahan</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <Input
                    placeholder="Cari bahan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Bahan Baru
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Tambah Bahan Baru</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          placeholder="Nama Bahan"
                          value={newIngredient.name}
                          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                        />
                        <Input
                          type="number"
                          placeholder="BK (%)"
                          value={newIngredient.bk || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, bk: parseFloat(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="PK (%)"
                          value={newIngredient.pk || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, pk: parseFloat(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="LK (%)"
                          value={newIngredient.lk || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, lk: parseFloat(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="SK (%)"
                          value={newIngredient.sk || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, sk: parseFloat(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="TDN (%)"
                          value={newIngredient.tdn || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, tdn: parseFloat(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="EM (Kkal/kg)"
                          value={newIngredient.em || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, em: parseFloat(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="Calcium (%)"
                          value={newIngredient.calcium || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, calcium: parseFloat(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="Harga/kg"
                          value={newIngredient.pricePerKg || ''}
                          onChange={(e) => setNewIngredient({ ...newIngredient, pricePerKg: parseFloat(e.target.value) })}
                        />
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAdd}>Simpan Bahan</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Bahan</TableHead>
                          <TableHead className="whitespace-nowrap">BK (%)</TableHead>
                          <TableHead className="whitespace-nowrap">PK (%)</TableHead>
                          <TableHead className="whitespace-nowrap">LK (%)</TableHead>
                          <TableHead className="whitespace-nowrap">SK (%)</TableHead>
                          <TableHead className="whitespace-nowrap">TDN (%)</TableHead>
                          <TableHead className="whitespace-nowrap">EM (Kkal/kg)</TableHead>
                          <TableHead className="whitespace-nowrap">Ca (%)</TableHead>
                          <TableHead className="whitespace-nowrap">Harga/kg</TableHead>
                          <TableHead className="whitespace-nowrap">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIngredients.map((ingredient) => (
                          <TableRow key={ingredient.id}>
                            <TableCell className="whitespace-nowrap">{ingredient.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.bk}%</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.pk}%</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.lk}%</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.sk}%</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.tdn}%</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.em}</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.calcium}%</TableCell>
                            <TableCell className="whitespace-nowrap">{ingredient.pricePerKg}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => onAddAvailableIngredient(ingredient)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Bahan Terpilih</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Bahan</TableHead>
                  <TableHead className="whitespace-nowrap">BK (%)</TableHead>
                  <TableHead className="whitespace-nowrap">PK (%)</TableHead>
                  <TableHead className="whitespace-nowrap">LK (%)</TableHead>
                  <TableHead className="whitespace-nowrap">SK (%)</TableHead>
                  <TableHead className="whitespace-nowrap">TDN (%)</TableHead>
                  <TableHead className="whitespace-nowrap">EM (Kkal/kg)</TableHead>
                  <TableHead className="whitespace-nowrap">Ca (%)</TableHead>
                  <TableHead className="whitespace-nowrap">Harga/kg</TableHead>
                  <TableHead className="whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="whitespace-nowrap">{ingredient.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.bk}%</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.pk}%</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.lk}%</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.sk}%</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.tdn}%</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.em}</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.calcium}%</TableCell>
                    <TableCell className="whitespace-nowrap">{ingredient.pricePerKg}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteIngredient(ingredient.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IngredientManager;

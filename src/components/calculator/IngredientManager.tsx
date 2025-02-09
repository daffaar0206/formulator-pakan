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
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Ingredient } from "../lib/formulationLogic";

interface IngredientManagerProps {
  ingredients: Ingredient[];
  availableIngredients: Ingredient[];
  onAddIngredient: (newIngredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
  onEditIngredient: (id: string, updatedIngredient: Ingredient) => void;
  onAddAvailableIngredient: (ingredient: Ingredient) => void;
  onRemoveAvailableIngredient: (id: string) => void;
}

const IngredientManager: React.FC<IngredientManagerProps> = ({
  ingredients,
  availableIngredients,
  onAddIngredient,
  onDeleteIngredient,
  onEditIngredient,
  onAddAvailableIngredient,
  onRemoveAvailableIngredient,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    id: "",
    name: "",
    bk: 0,
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
    pricePerKg: 0,
  });

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newIngredient.name) {
      alert("Nama bahan harus diisi");
      return;
    }

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
    });

    setNewIngredient({
      id: "",
      name: "",
      bk: 0,
      pk: 0,
      lk: 0,
      sk: 0,
      tdn: 0,
      em: 0,
      calcium: 0,
      pricePerKg: 0,
    });
  };

  return (
    <Card className="p-4 sm:p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bahan Formulasi</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full w-[90vw] h-auto p-0 bg-white shadow-lg rounded-lg">
            <div className="overflow-x-auto"> 
              <DialogHeader>
                <DialogTitle>Pilih Bahan</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <Input
                    placeholder="Cari bahan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <Table className="border-collapse w-full min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bahan</TableHead>
                      <TableHead>BK</TableHead>
                      <TableHead>PK</TableHead>
                      <TableHead>LK</TableHead>
                      <TableHead>SK</TableHead>
                      <TableHead>TDN</TableHead>
                      <TableHead>EM</TableHead>
                      <TableHead>Ca</TableHead>
                      <TableHead>Harga/kg</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell>{ingredient.name}</TableCell>
                        <TableCell>{ingredient.bk}%</TableCell>
                        <TableCell>{ingredient.pk}%</TableCell>
                        <TableCell>{ingredient.lk}%</TableCell>
                        <TableCell>{ingredient.sk}%</TableCell>
                        <TableCell>{ingredient.tdn}%</TableCell>
                        <TableCell>{ingredient.em}</TableCell>
                        <TableCell>{ingredient.calcium}%</TableCell>
                        <TableCell>{ingredient.pricePerKg}</TableCell>
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
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Bahan Terpilih</h3>
        <div className="overflow-auto border border-gray-300 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bahan</TableHead>
                <TableHead>BK</TableHead>
                <TableHead>PK</TableHead>
                <TableHead>LK</TableHead>
                <TableHead>SK</TableHead>
                <TableHead>TDN</TableHead>
                <TableHead>EM</TableHead>
                <TableHead>Ca</TableHead>
                <TableHead>Harga/kg</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>{ingredient.bk}%</TableCell>
                  <TableCell>{ingredient.pk}%</TableCell>
                  <TableCell>{ingredient.lk}%</TableCell>
                  <TableCell>{ingredient.sk}%</TableCell>
                  <TableCell>{ingredient.tdn}%</TableCell>
                  <TableCell>{ingredient.em}</TableCell>
                  <TableCell>{ingredient.calcium}%</TableCell>
                  <TableCell>{ingredient.pricePerKg}</TableCell>
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
    </Card>
  );
};

export default IngredientManager;

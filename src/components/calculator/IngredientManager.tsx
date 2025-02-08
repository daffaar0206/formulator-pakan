import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Ingredient {
  id: string;
  name: string;
  bk: number;
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  calcium: number;
  pricePerKg: number;
}

interface IngredientManagerProps {
  ingredients?: Ingredient[];
  onAddIngredient?: (ingredient: Omit<Ingredient, "id">) => void;
  onDeleteIngredient?: (id: string) => void;
  onEditIngredient?: (id: string, ingredient: Omit<Ingredient, "id">) => void;
}

const IngredientManager: React.FC<IngredientManagerProps> = ({
  ingredients = [],
  onAddIngredient = () => {},
  onDeleteIngredient = () => {},
  onEditIngredient = () => {},
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    bk: "",
    pk: "",
    lk: "",
    sk: "",
    tdn: "",
    calcium: "",
    pricePerKg: "",
  });

  const handleSubmit = () => {
    const ingredientToSubmit = {
      name: newIngredient.name,
      bk: parseFloat(newIngredient.bk as string) || 0,
      pk: parseFloat(newIngredient.pk as string) || 0,
      lk: parseFloat(newIngredient.lk as string) || 0,
      sk: parseFloat(newIngredient.sk as string) || 0,
      tdn: parseFloat(newIngredient.tdn as string) || 0,
      calcium: parseFloat(newIngredient.calcium as string) || 0,
      pricePerKg: parseFloat(newIngredient.pricePerKg as string) || 0,
    };

    if (editingIngredient) {
      onEditIngredient(editingIngredient.id, ingredientToSubmit);
    } else {
      onAddIngredient(ingredientToSubmit);
    }
    setIsDialogOpen(false);
    setEditingIngredient(null);
    setNewIngredient({
      name: "",
      bk: "",
      pk: "",
      lk: "",
      sk: "",
      tdn: "",
      calcium: "",
      pricePerKg: "",
    });
  };

  return (
    <Card className="p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manajemen Bahan</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Bahan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIngredient ? "Edit Bahan" : "Tambah Bahan Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  placeholder="Nama bahan"
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  type="number"
                  placeholder="BK (%)"
                  value={newIngredient.bk}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, bk: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="PK (%)"
                  value={newIngredient.pk}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, pk: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="LK (%)"
                  value={newIngredient.lk}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, lk: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="SK (%)"
                  value={newIngredient.sk}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, sk: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  type="number"
                  placeholder="TDN (%)"
                  value={newIngredient.tdn}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, tdn: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Calcium (%)"
                  value={newIngredient.calcium}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      calcium: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Harga per kg"
                  value={newIngredient.pricePerKg}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      pricePerKg: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSubmit}>
                {editingIngredient ? "Simpan Perubahan" : "Tambah Bahan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>BK (%)</TableHead>
            <TableHead>PK (%)</TableHead>
            <TableHead>LK (%)</TableHead>
            <TableHead>SK (%)</TableHead>
            <TableHead>TDN (%)</TableHead>
            <TableHead>Ca (%)</TableHead>
            <TableHead>Harga/kg</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell>{ingredient.name}</TableCell>
              <TableCell>{ingredient.bk}</TableCell>
              <TableCell>{ingredient.pk}</TableCell>
              <TableCell>{ingredient.lk}</TableCell>
              <TableCell>{ingredient.sk}</TableCell>
              <TableCell>{ingredient.tdn}</TableCell>
              <TableCell>{ingredient.calcium}</TableCell>
              <TableCell>Rp{ingredient.pricePerKg.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingIngredient(ingredient);
                      setNewIngredient({
                        name: ingredient.name,
                        bk: ingredient.bk.toString(),
                        pk: ingredient.pk.toString(),
                        lk: ingredient.lk.toString(),
                        sk: ingredient.sk.toString(),
                        tdn: ingredient.tdn.toString(),
                        calcium: ingredient.calcium.toString(),
                        pricePerKg: ingredient.pricePerKg.toString(),
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteIngredient(ingredient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default IngredientManager;

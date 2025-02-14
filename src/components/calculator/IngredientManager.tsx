import React, { useState, useEffect } from "react";
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
import { Ingredient } from "../../lib/formulationLogic";

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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showMainDialog, setShowMainDialog] = useState(false);
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

    // Check if ingredient with same name already exists
    if (ingredients.some(ing => ing.name === newIngredient.name) || 
        availableIngredients.some(ing => ing.name === newIngredient.name)) {
      alert("Bahan dengan nama yang sama sudah ada");
      return;
    }

    const ingredientToAdd = {
      ...newIngredient,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    onAddIngredient(ingredientToAdd);

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
    setShowAddDialog(false);
    setShowMainDialog(false);
  };

  return (
    <Card className="p-4 sm:p-6 bg-white">
      {/* Main Dialog for ingredient list */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bahan Formulasi</h2>
        <Dialog open={showMainDialog} onOpenChange={setShowMainDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowMainDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full w-[95vw] sm:w-[90vw] h-[90vh] p-0 bg-white shadow-lg rounded-lg">
            <div className="flex flex-col h-full">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Pilih Bahan</DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Cari bahan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Bahan Baru
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="h-[calc(90vh-200px)] overflow-y-auto touch-pan-y">
                  <div className="p-4 overflow-x-auto">
                    <Table className="border-collapse w-full min-w-[800px]">
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead className="min-w-[120px]">Bahan</TableHead>
                          <TableHead className="min-w-[60px]">BK</TableHead>
                          <TableHead className="min-w-[60px]">PK</TableHead>
                          <TableHead className="min-w-[60px]">LK</TableHead>
                          <TableHead className="min-w-[60px]">SK</TableHead>
                          <TableHead className="min-w-[60px]">TDN</TableHead>
                          <TableHead className="min-w-[60px]">EM</TableHead>
                          <TableHead className="min-w-[60px]">Ca</TableHead>
                          <TableHead className="min-w-[80px]">Harga/kg</TableHead>
                          <TableHead className="min-w-[60px]">Aksi</TableHead>
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
                            <TableCell>IDR {ingredient.pricePerKg}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => {
                                  onAddAvailableIngredient(ingredient);
                                  setSearchTerm("");
                                  setShowMainDialog(false);
                                }}
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Add New Ingredient Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tambah Bahan Baru</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label>Nama Bahan</label>
                <Input 
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                />
              </div>
              {['bk', 'pk', 'lk', 'sk', 'tdn', 'em', 'calcium', 'pricePerKg'].map((field) => (
                <div className="space-y-2" key={field}>
                  <label>{field.toUpperCase()}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={newIngredient[field as keyof Ingredient] ?? ''}
                        onChange={(e) => setNewIngredient({
                          ...newIngredient,
                          [field]: e.target.value ? parseFloat(e.target.value) : null
                        })}
                        placeholder="Masukkan nilai"
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500">
                        {field === 'pricePerKg' ? 'IDR' : field === 'em' ? 'kkal/kg' : '%'}
                      </span>
                    </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Bahan Terpilih</h3>
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <Table className="w-full min-w-[600px]">
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

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
          <DialogContent className="max-w-full w-[95vw] sm:w-[90vw] h-[85vh] sm:h-[90vh] p-0 bg-white shadow-lg rounded-lg" aria-describedby="ingredient-list-description">
            <div className="flex flex-col h-full overflow-hidden">
              <DialogHeader className="p-3 sm:p-4 border-b flex-none">
                <DialogTitle>Pilih Bahan</DialogTitle>
                <DialogDescription id="ingredient-list-description">
                  Pilih bahan yang tersedia atau tambahkan bahan baru
                </DialogDescription>
              </DialogHeader>
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 flex-none">
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
                <div className="h-full overflow-auto p-3 sm:p-4">
                  <Table className="border-collapse w-full min-w-[400px] sm:min-w-[800px]">
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="w-[30%] sm:w-auto min-w-[80px] sm:min-w-[120px]">Bahan</TableHead>
                        <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">BK</TableHead>
                        <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">PK</TableHead>
                        <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">LK</TableHead>
                        <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">SK</TableHead>
                        <TableHead className="hidden sm:table-cell min-w-[60px] text-right p-2">TDN</TableHead>
                        <TableHead className="hidden sm:table-cell min-w-[60px] text-right p-2">EM</TableHead>
                        <TableHead className="hidden sm:table-cell min-w-[60px] text-right p-2">Ca</TableHead>
                        <TableHead className="w-[20%] sm:w-auto min-w-[60px] sm:min-w-[80px] text-right p-2">Harga</TableHead>
                        <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] p-2">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIngredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell className="font-medium p-2">{ingredient.name}</TableCell>
                          <TableCell className="text-right p-2">{ingredient.bk}%</TableCell>
                          <TableCell className="text-right p-2">{ingredient.pk}%</TableCell>
                          <TableCell className="text-right p-2">{ingredient.lk}%</TableCell>
                          <TableCell className="text-right p-2">{ingredient.sk}%</TableCell>
                          <TableCell className="hidden sm:table-cell text-right p-2">{ingredient.tdn}%</TableCell>
                          <TableCell className="hidden sm:table-cell text-right p-2">{ingredient.em}</TableCell>
                          <TableCell className="hidden sm:table-cell text-right p-2">{ingredient.calcium}%</TableCell>
                          <TableCell className="text-right p-2">{Math.round(ingredient.pricePerKg/1000)}k</TableCell>
                          <TableCell className="p-2">
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
          </DialogContent>
        </Dialog>

        {/* Add New Ingredient Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-[95vw] sm:max-w-[600px] p-4 sm:p-6" aria-describedby="add-ingredient-description">
            <DialogHeader>
              <DialogTitle>Tambah Bahan Baru</DialogTitle>
              <DialogDescription id="add-ingredient-description">
                Masukkan informasi bahan yang akan ditambahkan
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nama Bahan</label>
                  <Input 
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                    className="h-9"
                    placeholder="Masukkan nama bahan"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['bk', 'pk', 'lk', 'sk'].map((field) => (
                    <div className="space-y-1" key={field}>
                      <label className="text-sm font-medium text-gray-700">{field.toUpperCase()}</label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={newIngredient[field as keyof Ingredient] ?? ''}
                          onChange={(e) => setNewIngredient({
                            ...newIngredient,
                            [field]: e.target.value ? parseFloat(e.target.value) : null
                          })}
                          placeholder="0"
                          className="flex-1 h-9 text-right px-1"
                        />
                        <span className="text-xs text-gray-500 w-4">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['tdn', 'em', 'calcium', 'pricePerKg'].map((field) => (
                    <div className="space-y-1" key={field}>
                      <label className="text-sm font-medium text-gray-700">{field.toUpperCase()}</label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={newIngredient[field as keyof Ingredient] ?? ''}
                          onChange={(e) => setNewIngredient({
                            ...newIngredient,
                            [field]: e.target.value ? parseFloat(e.target.value) : null
                          })}
                          placeholder="0"
                          className="flex-1 h-9 text-right px-1"
                        />
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {field === 'pricePerKg' ? 'IDR' : field === 'em' ? 'kkal' : '%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleAdd} className="w-full sm:w-auto">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Bahan Terpilih</h3>
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <Table className="w-full min-w-[500px] sm:min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%] sm:w-auto min-w-[80px] sm:min-w-[120px] p-2">Bahan</TableHead>
                <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">BK</TableHead>
                <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">PK</TableHead>
                <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">LK</TableHead>
                <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] text-right p-2">SK</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[60px] text-right p-2">TDN</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[60px] text-right p-2">EM</TableHead>
                <TableHead className="hidden sm:table-cell min-w-[60px] text-right p-2">Ca</TableHead>
                <TableHead className="w-[20%] sm:w-auto min-w-[60px] sm:min-w-[80px] text-right p-2">Harga</TableHead>
                <TableHead className="w-[10%] sm:w-auto min-w-[40px] sm:min-w-[60px] p-2">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium p-2">{ingredient.name}</TableCell>
                  <TableCell className="text-right p-2">{ingredient.bk}%</TableCell>
                  <TableCell className="text-right p-2">{ingredient.pk}%</TableCell>
                  <TableCell className="text-right p-2">{ingredient.lk}%</TableCell>
                  <TableCell className="text-right p-2">{ingredient.sk}%</TableCell>
                  <TableCell className="hidden sm:table-cell text-right p-2">{ingredient.tdn}%</TableCell>
                  <TableCell className="hidden sm:table-cell text-right p-2">{ingredient.em}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right p-2">{ingredient.calcium}%</TableCell>
                  <TableCell className="text-right p-2">{Math.round(ingredient.pricePerKg/1000)}k</TableCell>
                  <TableCell className="p-2">
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

import React, { useState, useEffect } from "react";
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
import { Edit2, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { nutritionalRequirements, addAgeGroup, deleteAnimalType, deleteAgeGroup } from "@/lib/nutritionalRequirements";
import AddAnimalDialog from "./AddAnimalDialog";
import AddAgeGroupDialog from "./AddAgeGroupDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface AnimalRequirementsManagerProps {
  selectedAnimalType: string;
  selectedAgeGroup: string;
  onUpdateRequirements: (pk: number, lk: number, sk: number, tdn: number, em: number, calcium: number) => void;
  onAddAnimalType: (type: string, ageGroup: string, requirements: any) => void;
}

const AnimalRequirementsManager: React.FC<AnimalRequirementsManagerProps> = ({
  selectedAnimalType,
  selectedAgeGroup,
  onUpdateRequirements,
  onAddAnimalType,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedRequirements, setEditedRequirements] = useState({
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  });

  useEffect(() => {
    const currentRequirements = nutritionalRequirements[selectedAnimalType]?.[selectedAgeGroup];
    if (currentRequirements && !isEditing) {
      setEditedRequirements({
        pk: currentRequirements.pk,
        lk: currentRequirements.lk,
        sk: currentRequirements.sk,
        tdn: currentRequirements.tdn,
        em: currentRequirements.em,
        calcium: currentRequirements.calcium,
      });
    }
  }, [selectedAnimalType, selectedAgeGroup, isEditing]);

  const currentRequirements = nutritionalRequirements[selectedAnimalType]?.[selectedAgeGroup] || {
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  };

  const handleSave = () => {
    onUpdateRequirements(
      editedRequirements.pk,
      editedRequirements.lk,
      editedRequirements.sk,
      editedRequirements.tdn,
      editedRequirements.em,
      editedRequirements.calcium
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRequirements({
      pk: currentRequirements.pk,
      lk: currentRequirements.lk,
      sk: currentRequirements.sk,
      tdn: currentRequirements.tdn,
      em: currentRequirements.em,
      calcium: currentRequirements.calcium,
    });
    setIsEditing(false);
  };

  const handleDeleteAnimalType = () => {
    try {
      deleteAnimalType(selectedAnimalType);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteAgeGroup = () => {
    try {
      deleteAgeGroup(selectedAnimalType, selectedAgeGroup);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddAgeGroup = (ageGroup: string, requirements: any) => {
    try {
      addAgeGroup(selectedAnimalType, ageGroup, requirements);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-xl sm:text-2xl font-bold">Kebutuhan Nutrisi</h2>
          {isExpanded ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {selectedAnimalType} - {selectedAgeGroup}
          </div>
          <div className="flex flex-wrap gap-2">
            <AddAnimalDialog onAddAnimal={onAddAnimalType} />
            <AddAgeGroupDialog 
              animalType={selectedAnimalType}
              onAddAgeGroup={handleAddAgeGroup}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "Batal" : "Edit"}
            </Button>
            {isEditing && (
              <Button size="sm" onClick={handleSave}>
                Simpan
              </Button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <div className="min-w-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nutrisi</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Protein Kasar (PK)</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedRequirements.pk}
                          onChange={(e) =>
                            setEditedRequirements({
                              ...editedRequirements,
                              pk: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 sm:w-24"
                        />
                      ) : (
                        currentRequirements.pk
                      )}
                    </TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lemak Kasar (LK)</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedRequirements.lk}
                          onChange={(e) =>
                            setEditedRequirements({
                              ...editedRequirements,
                              lk: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 sm:w-24"
                        />
                      ) : (
                        currentRequirements.lk
                      )}
                    </TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Serat Kasar (SK)</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedRequirements.sk}
                          onChange={(e) =>
                            setEditedRequirements({
                              ...editedRequirements,
                              sk: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 sm:w-24"
                        />
                      ) : (
                        currentRequirements.sk
                      )}
                    </TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TDN</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedRequirements.tdn}
                          onChange={(e) =>
                            setEditedRequirements({
                              ...editedRequirements,
                              tdn: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 sm:w-24"
                        />
                      ) : (
                        currentRequirements.tdn
                      )}
                    </TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Energi Metabolisme (EM)</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedRequirements.em}
                          onChange={(e) =>
                            setEditedRequirements({
                              ...editedRequirements,
                              em: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 sm:w-24"
                        />
                      ) : (
                        currentRequirements.em
                      )}
                    </TableCell>
                    <TableCell>Kkal/kg</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Kalsium (Ca)</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedRequirements.calcium}
                          onChange={(e) =>
                            setEditedRequirements({
                              ...editedRequirements,
                              calcium: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 sm:w-24"
                        />
                      ) : (
                        currentRequirements.calcium
                      )}
                    </TableCell>
                    <TableCell>%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Umur
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Kelompok Umur</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus kelompok umur ini? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAgeGroup}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Hewan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Jenis Hewan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus jenis hewan ini? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAnimalType}>
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AnimalRequirementsManager;

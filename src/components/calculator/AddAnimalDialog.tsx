import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";

interface AddAnimalDialogProps {
  onAddAnimal: (animalType: string, ageGroup: string, requirements: {
    pk: number;
    lk: number;
    sk: number;
    tdn: number;
    em: number;
    calcium: number;
  }) => void;
}

const AddAnimalDialog: React.FC<AddAnimalDialogProps> = ({ onAddAnimal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animalType, setAnimalType] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [requirements, setRequirements] = useState({
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  });

  const handleSubmit = () => {
    if (!animalType || !ageGroup) {
      alert("Mohon isi nama hewan dan kelompok umur");
      return;
    }

    onAddAnimal(animalType, ageGroup, requirements);
    setIsOpen(false);
    
    // Reset form
    setAnimalType("");
    setAgeGroup("");
    setRequirements({
      pk: 0,
      lk: 0,
      sk: 0,
      tdn: 0,
      em: 0,
      calcium: 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Hewan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Jenis Hewan Baru</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nama Hewan"
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
            />
            <Input
              placeholder="Kelompok Umur"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Input
              type="number"
              placeholder="PK (%)"
              value={requirements.pk || ""}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  pk: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Input
              type="number"
              placeholder="LK (%)"
              value={requirements.lk || ""}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  lk: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Input
              type="number"
              placeholder="SK (%)"
              value={requirements.sk || ""}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  sk: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Input
              type="number"
              placeholder="TDN (%)"
              value={requirements.tdn || ""}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  tdn: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Input
              type="number"
              placeholder="EM (Kkal/kg)"
              value={requirements.em || ""}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  em: parseFloat(e.target.value) || 0,
                })
              }
            />
            <Input
              type="number"
              placeholder="Calcium (%)"
              value={requirements.calcium || ""}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  calcium: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Tambah Hewan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnimalDialog;

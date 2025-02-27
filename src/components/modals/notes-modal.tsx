
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes?: string;
  onSave?: (notes: string) => void;
}

export function NotesModal({ isOpen, onClose, notes, onSave }: NotesModalProps) {
  const [currentNotes, setCurrentNotes] = useState(notes || "");
  const isEditable = Boolean(onSave);

  const handleSave = () => {
    if (onSave) {
      onSave(currentNotes);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Observações</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isEditable ? (
            <textarea
              className="w-full min-h-[150px] p-3 rounded-md border bg-white focus:outline-none"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
            />
          ) : (
            <div className="p-3 rounded-md border min-h-[150px] bg-white">
              {notes || "Nenhuma observação disponível."}
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>
          {isEditable && (
            <Button type="button" onClick={handleSave}>
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes?: string;
}

export function NotesModal({ isOpen, onClose, notes }: NotesModalProps) {
  const [currentNotes, setCurrentNotes] = useState(notes || "");

  useEffect(() => {
    setCurrentNotes(notes || "");
  }, [notes]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Observações</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-4">
            <textarea
              className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Digite suas observações aqui..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => onClose()}>
                Salvar
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


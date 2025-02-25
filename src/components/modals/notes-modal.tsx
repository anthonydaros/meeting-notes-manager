
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes?: string;
}

export function NotesModal({ isOpen, onClose, notes }: NotesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Observações</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="p-4">
            {notes || "Nenhuma observação registrada."}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plan: Omit<ActionPlan, "id">) => void;
}

interface ActionPlan {
  id: number;
  dateTime: string;
  department: string;
  action: string;
  solution: string;
  startDate: string;
  endDate: string;
  responsible: string;
  investment: string;
  status: "complete" | "progress" | "overdue";
  notes?: string;
}

export function AddPlanModal({ isOpen, onClose, onAdd }: AddPlanModalProps) {
  const [formData, setFormData] = useState<Omit<ActionPlan, "id">>({
    dateTime: "",
    department: "",
    action: "",
    solution: "",
    startDate: "",
    endDate: "",
    responsible: "",
    investment: "",
    status: "progress",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Plano de Ação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateTime">Data e Hora</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                required
                value={formData.dateTime}
                onChange={(e) =>
                  setFormData({ ...formData, dateTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Setor</Label>
              <Input
                id="department"
                type="text"
                required
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                type="text"
                required
                value={formData.responsible}
                onChange={(e) =>
                  setFormData({ ...formData, responsible: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment">Investimento</Label>
              <Input
                id="investment"
                type="text"
                required
                value={formData.investment}
                onChange={(e) =>
                  setFormData({ ...formData, investment: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="action">Ação</Label>
            <Input
              id="action"
              type="text"
              required
              value={formData.action}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="solution">Solução</Label>
            <Input
              id="solution"
              type="text"
              required
              value={formData.solution}
              onChange={(e) =>
                setFormData({ ...formData, solution: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Início</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Término</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <span className={`status-badge status-${formData.status} mr-2`} />
                  <span>
                    {formData.status === "complete"
                      ? "Concluído"
                      : formData.status === "progress"
                      ? "Em Andamento"
                      : "Atrasado"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0">
                <div className="flex flex-col">
                  {(["complete", "progress", "overdue"] as const).map((status) => (
                    <Button
                      key={status}
                      variant="ghost"
                      className="justify-start"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          status,
                        })
                      }
                    >
                      <span className={`status-badge status-${status} mr-2`} />
                      <span>
                        {status === "complete"
                          ? "Concluído"
                          : status === "progress"
                          ? "Em Andamento"
                          : "Atrasado"}
                      </span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

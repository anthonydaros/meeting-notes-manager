import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, MessageCircle, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { NotesModal } from "@/components/modals/notes-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

const initialData: ActionPlan[] = [
  {
    id: 1,
    dateTime: "2024-03-20 10:00",
    department: "TI",
    action: "Atualizar sistemas",
    solution: "Realizar update de todos os servidores",
    startDate: "2024-03-21",
    endDate: "2024-03-25",
    responsible: "João Silva",
    investment: "R$ 5.000",
    status: "progress",
    notes: "Update será realizado em etapas para minimizar o impacto.",
  },
  {
    id: 2,
    dateTime: "2024-03-19 14:30",
    department: "RH",
    action: "Treinamento de equipe",
    solution: "Contratar consultoria especializada",
    startDate: "2024-03-22",
    endDate: "2024-03-24",
    responsible: "Maria Santos",
    investment: "R$ 3.000",
    status: "complete",
    notes: "Consultoria já contratada, aguardando início.",
  },
  {
    id: 3,
    dateTime: "2024-03-18 09:00",
    department: "Financeiro",
    action: "Relatório trimestral",
    solution: "Compilar dados financeiros do Q1",
    startDate: "2024-03-19",
    endDate: "2024-03-20",
    responsible: "Pedro Costa",
    investment: "N/A",
    status: "overdue",
    notes: "Dados do mês de março ainda não disponíveis.",
  },
];

const StatusPopover = ({ status, onChange }: {
  status: ActionPlan["status"];
  onChange: (newStatus: ActionPlan["status"]) => void;
}) => {
  const statusOptions = [
    { value: "complete", label: "Concluído" },
    { value: "progress", label: "Em Andamento" },
    { value: "overdue", label: "Atrasado" },
  ] as const;

  return (
    <Popover>
      <PopoverTrigger>
        <span className={`status-badge status-${status} cursor-pointer hover:opacity-80`} />
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        <div className="flex flex-col gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`flex items-center gap-2 p-2 rounded hover:bg-slate-50 ${
                status === option.value ? "bg-slate-100" : ""
              }`}
              onClick={() => onChange(option.value)}
            >
              <span className={`status-badge status-${option.value}`} />
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

type SortConfig = {
  key: keyof ActionPlan | null;
  direction: "asc" | "desc" | null;
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(initialData);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: keyof ActionPlan;
  } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: "",
    startDate: "",
    endDate: "",
    responsible: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });

  const handleCellEdit = (
    id: number,
    field: keyof ActionPlan,
    value: string
  ) => {
    setActionPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, [field]: value } : plan
      )
    );
    setEditingCell(null);
  };

  const handleStatusChange = (id: number, newStatus: ActionPlan["status"]) => {
    setActionPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, status: newStatus } : plan
      )
    );
  };

  const handleDeletePlan = (id: number) => {
    setSelectedPlanId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlanId) {
      setActionPlans((prev) => prev.filter((plan) => plan.id !== selectedPlanId));
      setIsDeleteModalOpen(false);
      setSelectedPlanId(null);
    }
  };

  const handleViewNotes = (id: number) => {
    setSelectedPlanId(id);
    setIsNotesModalOpen(true);
  };

  const handleSort = (key: keyof ActionPlan) => {
    setSortConfig((current) => {
      if (current.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        if (current.direction === "desc") {
          return { key: null, direction: null };
        }
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key: keyof ActionPlan) => {
    if (sortConfig.key !== key) {
      return <div className="w-4 h-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  let filteredPlans = actionPlans.filter((plan) => {
    const matchesSearch = Object.values(plan).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesDepartment = filters.department
      ? plan.department.toLowerCase().includes(filters.department.toLowerCase())
      : true;

    const matchesStartDate = filters.startDate
      ? plan.startDate === filters.startDate
      : true;

    const matchesEndDate = filters.endDate
      ? plan.endDate === filters.endDate
      : true;

    const matchesResponsible = filters.responsible
      ? plan.responsible.toLowerCase().includes(filters.responsible.toLowerCase())
      : true;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStartDate &&
      matchesEndDate &&
      matchesResponsible
    );
  });

  if (sortConfig.key && sortConfig.direction) {
    filteredPlans.sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  const selectedPlan = actionPlans.find((plan) => plan.id === selectedPlanId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Planos de Ação
            </h2>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie todos os planos de ação
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar planos de ação..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Input
            type="text"
            placeholder="Setor"
            className="max-w-[150px]"
            value={filters.department}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, department: e.target.value }))
            }
          />
          <Input
            type="date"
            className="max-w-[150px]"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
          <Input
            type="date"
            className="max-w-[150px]"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
          <Input
            type="text"
            placeholder="Responsável"
            className="max-w-[150px]"
            value={filters.responsible}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, responsible: e.target.value }))
            }
          />
        </div>

        <div className="table-container">
          <table className="action-plans-table">
            <thead>
              <tr>
                <th>#</th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("dateTime")}>
                  <div className="flex items-center gap-2">
                    Data e Hora
                    {getSortIcon("dateTime")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("department")}>
                  <div className="flex items-center gap-2">
                    Setor
                    {getSortIcon("department")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("action")}>
                  <div className="flex items-center gap-2">
                    Ação
                    {getSortIcon("action")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("solution")}>
                  <div className="flex items-center gap-2">
                    Solução
                    {getSortIcon("solution")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("startDate")}>
                  <div className="flex items-center gap-2">
                    Início
                    {getSortIcon("startDate")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("endDate")}>
                  <div className="flex items-center gap-2">
                    Término
                    {getSortIcon("endDate")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("responsible")}>
                  <div className="flex items-center gap-2">
                    Responsável
                    {getSortIcon("responsible")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("investment")}>
                  <div className="flex items-center gap-2">
                    Investimento
                    {getSortIcon("investment")}
                  </div>
                </th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.id}</td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "dateTime" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "dateTime" ? (
                      <input
                        type="datetime-local"
                        defaultValue={plan.dateTime}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "dateTime", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.dateTime
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "department" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "department" ? (
                      <input
                        type="text"
                        defaultValue={plan.department}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "department", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.department
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "action" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "action" ? (
                      <input
                        type="text"
                        defaultValue={plan.action}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "action", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.action
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "solution" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "solution" ? (
                      <input
                        type="text"
                        defaultValue={plan.solution}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "solution", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.solution
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "startDate" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "startDate" ? (
                      <input
                        type="date"
                        defaultValue={plan.startDate}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "startDate", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.startDate
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "endDate" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "endDate" ? (
                      <input
                        type="date"
                        defaultValue={plan.endDate}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "endDate", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.endDate
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "responsible" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "responsible" ? (
                      <input
                        type="text"
                        defaultValue={plan.responsible}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "responsible", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.responsible
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: plan.id, field: "investment" })
                    }
                  >
                    {editingCell?.id === plan.id &&
                    editingCell.field === "investment" ? (
                      <input
                        type="text"
                        defaultValue={plan.investment}
                        onBlur={(e) =>
                          handleCellEdit(plan.id, "investment", e.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      plan.investment
                    )}
                  </td>
                  <td className="text-center">
                    <StatusPopover
                      status={plan.status}
                      onChange={(newStatus) => handleStatusChange(plan.id, newStatus)}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Observações"
                        onClick={() => handleViewNotes(plan.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeletePlan(plan.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={selectedPlan?.notes}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </AppLayout>
  );
};

export default Index;

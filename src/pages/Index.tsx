
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, MessageCircle } from "lucide-react";
import { useState } from "react";

// Tipos para nossos dados
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
}

// Dados de exemplo
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
  },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>(initialData);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: keyof ActionPlan;
  } | null>(null);

  const getStatusBadgeClass = (status: ActionPlan["status"]) => {
    return `status-badge status-${status}`;
  };

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

  const handleDeletePlan = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este plano de ação?")) {
      setActionPlans((prev) => prev.filter((plan) => plan.id !== id));
    }
  };

  const filteredPlans = actionPlans.filter((plan) =>
    Object.values(plan).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
        </div>

        <div className="table-container">
          <table className="action-plans-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Data e Hora</th>
                <th>Setor</th>
                <th>Ação</th>
                <th>Solução</th>
                <th>Início</th>
                <th>Término</th>
                <th>Responsável</th>
                <th>Investimento</th>
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
                  <td>
                    <span className={getStatusBadgeClass(plan.status)}>
                      {plan.status === "complete"
                        ? "Concluído"
                        : plan.status === "progress"
                        ? "Em Andamento"
                        : "Atrasado"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Observações"
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
    </AppLayout>
  );
};

export default Index;

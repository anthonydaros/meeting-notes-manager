import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, MessageCircle, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { NotesModal } from "@/components/modals/notes-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { AddPlanModal } from "@/components/modals/add-plan-modal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ActionPlan {
  id: string;
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
  created_at?: string;
  updated_at?: string;
}

type SortConfig = {
  key: keyof ActionPlan | null;
  direction: "asc" | "desc" | null;
};

interface Filters {
  department: string;
  startDate: string;
  endDate: string;
  responsible: string;
}

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

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(2)} ${date.getHours().toString().padStart(2, '0')}h${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(2)}`;
};

const ITEMS_PER_PAGE = 50;

const mapDatabaseToActionPlan = (data: any): ActionPlan => {
  return {
    id: data.id,
    dateTime: data.date_time,
    department: data.department,
    action: data.action,
    solution: data.solution,
    startDate: data.start_date,
    endDate: data.end_date,
    responsible: data.responsible,
    investment: data.investment,
    status: data.status as "complete" | "progress" | "overdue",
    notes: data.notes,
  };
};

const mapActionPlanToDatabase = (data: Partial<ActionPlan>) => {
  const mappedData: Record<string, any> = {};
  
  if (data.dateTime !== undefined) mappedData.date_time = data.dateTime;
  if (data.department !== undefined) mappedData.department = data.department;
  if (data.action !== undefined) mappedData.action = data.action;
  if (data.solution !== undefined) mappedData.solution = data.solution;
  if (data.startDate !== undefined) mappedData.start_date = data.startDate;
  if (data.endDate !== undefined) mappedData.end_date = data.endDate;
  if (data.responsible !== undefined) mappedData.responsible = data.responsible;
  if (data.investment !== undefined) mappedData.investment = data.investment;
  if (data.status !== undefined) mappedData.status = data.status;
  if (data.notes !== undefined) mappedData.notes = data.notes;
  
  return mappedData;
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof ActionPlan;
  } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  const [filters, setFilters] = useState<Filters>({
    department: "",
    startDate: "",
    endDate: "",
    responsible: "",
  });

  const fetchActionPlans = async () => {
    setIsLoading(true);
    try {
      console.log('Iniciando busca dos planos de ação...');
      
      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }
      
      console.log('Dados recebidos:', data);
      
      const mappedData: ActionPlan[] = data.map((item) => ({
        id: item.id,
        dateTime: item.date_time,
        department: item.department,
        action: item.action,
        solution: item.solution,
        startDate: item.start_date,
        endDate: item.end_date,
        responsible: item.responsible,
        investment: item.investment,
        status: item.status,
        notes: item.notes,
      }));

      console.log('Dados mapeados:', mappedData);
      setActionPlans(mappedData);
    } catch (error) {
      console.error('Erro detalhado ao buscar planos de ação:', error);
      toast.error('Erro ao carregar planos de ação. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActionPlans();
  }, []);

  const handleAddPlan = async (newPlan: Omit<ActionPlan, "id">) => {
    try {
      const mappedPlan = mapActionPlanToDatabase(newPlan);
      
      const { data, error } = await supabase
        .from('action_plans')
        .insert(mappedPlan)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success('Plano de ação adicionado com sucesso');
      setActionPlans((prev) => [mapDatabaseToActionPlan(data), ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar plano de ação:', error);
      toast.error('Erro ao adicionar plano de ação');
    }
    setIsAddModalOpen(false);
  };

  const handleCellEdit = async (
    id: string,
    field: keyof ActionPlan,
    value: string
  ) => {
    try {
      const dataToUpdate: Partial<ActionPlan> = {
        [field]: value,
      };
      
      const mappedData = mapActionPlanToDatabase(dataToUpdate);
      
      const { error } = await supabase
        .from('action_plans')
        .update(mappedData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setActionPlans((prev) =>
        prev.map((plan) =>
          plan.id === id ? { ...plan, [field]: value } : plan
        )
      );
      
      toast.success('Plano de ação atualizado');
    } catch (error) {
      console.error('Erro ao atualizar plano de ação:', error);
      toast.error('Erro ao atualizar plano de ação');
    }
    
    setEditingCell(null);
  };

  const handleStatusChange = async (id: string, newStatus: ActionPlan["status"]) => {
    try {
      const { error } = await supabase
        .from('action_plans')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setActionPlans((prev) =>
        prev.map((plan) =>
          plan.id === id ? { ...plan, status: newStatus } : plan
        )
      );
      
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeletePlan = (id: string) => {
    setSelectedPlanId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPlanId) {
      try {
        const { error } = await supabase
          .from('action_plans')
          .delete()
          .eq('id', selectedPlanId);
        
        if (error) {
          throw error;
        }
        
        setActionPlans((prev) => prev.filter((plan) => plan.id !== selectedPlanId));
        toast.success('Plano de ação excluído com sucesso');
      } catch (error) {
        console.error('Erro ao excluir plano de ação:', error);
        toast.error('Erro ao excluir plano de ação');
      }
      
      setIsDeleteModalOpen(false);
      setSelectedPlanId(null);
    }
  };

  const handleViewNotes = (id: string) => {
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

  const totalPages = Math.ceil(filteredPlans.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
          <Button
            variant="outline"
            className="bg-[#333333] text-white hover:bg-[#222222]"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo
          </Button>
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
            placeholder="Setor/Responsável"
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
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
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
                      Setor/Responsável
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
                {paginatedPlans.length > 0 ? (
                  paginatedPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.id.substring(0, 5)}</td>
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
                          formatDateTime(plan.dateTime)
                        )}
                      </td>
                      <td className="editable-cell">
                        <div className="flex flex-col gap-1">
                          <div
                            className="font-medium text-slate-900"
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
                          </div>
                          <div
                            className="text-sm text-slate-600"
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
                                  handleCellEdit(
                                    plan.id,
                                    "responsible",
                                    e.target.value
                                  )
                                }
                                autoFocus
                              />
                            ) : (
                              plan.responsible
                            )}
                          </div>
                        </div>
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
                          formatDate(plan.startDate)
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
                          formatDate(plan.endDate)
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      Nenhum plano de ação encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {filteredPlans.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

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

        <AddPlanModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddPlan}
        />
      </div>
    </AppLayout>
  );
};

export default Index;

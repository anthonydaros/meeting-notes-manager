
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronUp, ChevronDown, Plus, Trash2, MessageCircle } from "lucide-react";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
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
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
}

const initialUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Usuário ${i + 1}`,
  email: `usuario${i + 1}@empresa.com`,
  department: `Departamento ${(i % 5) + 1}`,
  role: `Cargo ${(i % 3) + 1}`,
  status: i % 2 === 0 ? "active" : "inactive",
}));

type SortConfig = {
  key: keyof User | null;
  direction: "asc" | "desc" | null;
};

const ITEMS_PER_PAGE = 10;

const StatusPopover = ({ status, onChange }: {
  status: User["status"];
  onChange: (newStatus: User["status"]) => void;
}) => {
  const statusOptions = [
    { value: "active", label: "Ativo" },
    { value: "inactive", label: "Inativo" },
  ] as const;

  return (
    <Popover>
      <PopoverTrigger>
        <span 
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status === "active" ? "Ativo" : "Inativo"}
        </span>
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
              <span className={`inline-block w-2 h-2 rounded-full ${
                option.value === "active" ? "bg-green-500" : "bg-red-500"
              }`} />
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: keyof User;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCellEdit = (
    id: number,
    field: keyof User,
    value: string
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, [field]: value } : user
      )
    );
    setEditingCell(null);
  };

  const handleStatusChange = (id: number, newStatus: User["status"]) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: newStatus } : user
      )
    );
  };

  const handleDeleteUser = (id: number) => {
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      setUsers((prev) => prev.filter((user) => user.id !== selectedUserId));
      setIsDeleteModalOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleSort = (key: keyof User) => {
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

  const getSortIcon = (key: keyof User) => {
    if (sortConfig.key !== key) {
      return <div className="w-4 h-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  let filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (sortConfig.key && sortConfig.direction) {
    filteredUsers.sort((a, b) => {
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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Usuários
            </h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-[#333333] text-white hover:bg-[#222222]"
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
              placeholder="Buscar usuários..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Input
            type="text"
            placeholder="Departamento"
            className="max-w-[150px]"
          />
        </div>

        <div className="table-container">
          <table className="action-plans-table">
            <thead>
              <tr>
                <th>#</th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-2">
                    Nome
                    {getSortIcon("name")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-2">
                    Email
                    {getSortIcon("email")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("department")}>
                  <div className="flex items-center gap-2">
                    Departamento
                    {getSortIcon("department")}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort("role")}>
                  <div className="flex items-center gap-2">
                    Cargo
                    {getSortIcon("role")}
                  </div>
                </th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: user.id, field: "name" })
                    }
                  >
                    {editingCell?.id === user.id &&
                    editingCell.field === "name" ? (
                      <input
                        type="text"
                        defaultValue={user.name}
                        onBlur={(e) =>
                          handleCellEdit(user.id, "name", e.target.value)
                        }
                        autoFocus
                        className="w-full p-1 border rounded bg-white"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: user.id, field: "email" })
                    }
                  >
                    {editingCell?.id === user.id &&
                    editingCell.field === "email" ? (
                      <input
                        type="text"
                        defaultValue={user.email}
                        onBlur={(e) =>
                          handleCellEdit(user.id, "email", e.target.value)
                        }
                        autoFocus
                        className="w-full p-1 border rounded bg-white"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: user.id, field: "department" })
                    }
                  >
                    {editingCell?.id === user.id &&
                    editingCell.field === "department" ? (
                      <input
                        type="text"
                        defaultValue={user.department}
                        onBlur={(e) =>
                          handleCellEdit(user.id, "department", e.target.value)
                        }
                        autoFocus
                        className="w-full p-1 border rounded bg-white"
                      />
                    ) : (
                      user.department
                    )}
                  </td>
                  <td
                    className="editable-cell"
                    onClick={() =>
                      setEditingCell({ id: user.id, field: "role" })
                    }
                  >
                    {editingCell?.id === user.id &&
                    editingCell.field === "role" ? (
                      <input
                        type="text"
                        defaultValue={user.role}
                        onBlur={(e) =>
                          handleCellEdit(user.id, "role", e.target.value)
                        }
                        autoFocus
                        className="w-full p-1 border rounded bg-white"
                      />
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="text-center">
                    <StatusPopover
                      status={user.status}
                      onChange={(newStatus) => handleStatusChange(user.id, newStatus)}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteUser(user.id)}
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

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  );
};

export default Users;


import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, ChevronUp, ChevronDown, Plus, Pencil } from "lucide-react";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { UserFormModal } from "@/components/modals/user-form-modal";

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@empresa.com",
    department: "Departamento 1",
    role: "Gerente",
    status: "active",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@empresa.com",
    department: "Departamento 2",
    role: "Analista",
    status: "inactive",
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos.oliveira@empresa.com",
    department: "Departamento 3",
    role: "Desenvolvedor",
    status: "active",
  },
  {
    id: 4,
    name: "Ana Costa",
    email: "ana.costa@empresa.com",
    department: "Departamento 1",
    role: "Designer",
    status: "inactive",
  },
  {
    id: 5,
    name: "Roberto Almeida",
    email: "roberto.almeida@empresa.com",
    department: "Departamento 2",
    role: "Coordenador",
    status: "active",
  }
];

type SortConfig = {
  key: keyof User | null;
  direction: "asc" | "desc" | null;
};

const ITEMS_PER_PAGE = 10;

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: keyof User;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });

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

  const handleDeleteUser = (id: number) => {
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

  const handleEditUser = (id: number) => {
    const user = users.find(user => user.id === id);
    if (user) {
      setEditingUser(user);
      setIsUserFormModalOpen(true);
    }
  };

  const handleAddUser = () => {
    setEditingUser(undefined);
    setIsUserFormModalOpen(true);
  };

  const handleSaveUser = (userData: Omit<User, "id"> & { id?: number }) => {
    if (userData.id) {
      // Editar usuário existente
      setUsers(prev => 
        prev.map(user => 
          user.id === userData.id ? { ...userData, id: user.id } as User : user
        )
      );
    } else {
      // Adicionar novo usuário
      const newId = Math.max(0, ...users.map(user => user.id)) + 1;
      setUsers(prev => [...prev, { ...userData, id: newId } as User]);
    }
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

  let filteredUsers = users.filter((user) => {
    const matchesSearch = Object.values(user).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return matchesSearch;
  });

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
            onClick={handleAddUser}
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
                        className="w-full p-1 bg-white border rounded"
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
                        className="w-full p-1 bg-white border rounded"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => handleEditUser(user.id)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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

        <UserFormModal
          isOpen={isUserFormModalOpen}
          onClose={() => setIsUserFormModalOpen(false)}
          onSave={handleSaveUser}
          user={editingUser}
          title={editingUser ? "Editar Usuário" : "Adicionar Usuário"}
        />
      </div>
    </AppLayout>
  );
};

export default Users;

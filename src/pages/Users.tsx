
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, ChevronUp, ChevronDown, Plus, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
  password?: string;
}

type SortConfig = {
  key: keyof User | null;
  direction: "asc" | "desc" | null;
};

const ITEMS_PER_PAGE = 10;

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof User;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });

  // Buscar usuários do Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os usuários autenticados e seus metadados
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Buscar perfis dos usuários
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profilesError) throw profilesError;
      
      // Combinar dados de auth com profiles
      const combinedUsers = authUsers.map(authUser => {
        const profile = profilesData.find(p => p.id === authUser.id);
        
        // Extrair departamento e função dos metadados do usuário
        const userMetadata = authUser.user_metadata || {};
        
        return {
          id: authUser.id,
          name: profile?.full_name || authUser.email?.split('@')[0] || 'Sem nome',
          email: authUser.email || '',
          department: userMetadata.department || 'Não atribuído',
          role: userMetadata.role || 'Usuário',
          status: authUser.user_metadata?.disabled ? 'inactive' : 'active' as 'active' | 'inactive',
        };
      });
      
      setUsers(combinedUsers);
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Não foi possível carregar os usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = async (
    id: string,
    field: keyof User,
    value: string
  ) => {
    try {
      // Atualizar UI primeiro para responsividade
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, [field]: value } : user
        )
      );
      
      // Atualizar no Supabase
      if (field === 'name') {
        // Atualizar nome completo no perfil
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: value })
          .eq("id", id);
          
        if (error) throw error;
      } else if (field === 'department' || field === 'role') {
        // Armazenar department e role como metadados do usuário
        const { error } = await supabase.auth.admin.updateUserById(
          id,
          { 
            user_metadata: { 
              [field]: value 
            } 
          }
        );
        
        if (error) throw error;
      } else if (field === 'status') {
        // Desabilitar/habilitar usuário usando metadados
        const { error } = await supabase.auth.admin.updateUserById(
          id,
          { 
            user_metadata: { 
              disabled: value === 'inactive' 
            } 
          }
        );
        
        if (error) throw error;
      }
      
      toast.success("Usuário atualizado com sucesso");
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Falha ao atualizar: " + error.message);
      // Recarregar dados do servidor
      fetchUsers();
    } finally {
      setEditingCell(null);
    }
  };

  const handleDeleteUser = (id: string) => {
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

  const handleEditUser = (id: string) => {
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

  const handleSaveUser = async (userData: Omit<User, "id"> & { id?: string }) => {
    try {
      if (userData.id) {
        // Editar usuário existente
        // Atualizar perfil para o nome
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: userData.name
          })
          .eq("id", userData.id);
          
        if (profileError) throw profileError;
        
        // Atualizar metadados do usuário para department e role
        const { error: metadataError } = await supabase.auth.admin.updateUserById(
          userData.id,
          { 
            user_metadata: { 
              department: userData.department,
              role: userData.role,
              disabled: userData.status === 'inactive'
            } 
          }
        );
        
        if (metadataError) throw metadataError;
        
        // Atualizar senha se fornecida
        if (userData.password) {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            userData.id,
            { password: userData.password }
          );
          
          if (authError) throw authError;
        }
        
        toast.success("Usuário atualizado com sucesso");
      } else {
        // Adicionar novo usuário
        // Registrar usuário com auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password || Math.random().toString(36).slice(-8),
          email_confirm: true,
          user_metadata: {
            full_name: userData.name,
            department: userData.department,
            role: userData.role,
            disabled: userData.status === 'inactive'
          }
        });
        
        if (authError) throw authError;
        
        toast.success("Novo usuário criado com sucesso");
      }
      
      // Recarregar lista de usuários
      fetchUsers();
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Falha ao salvar usuário: " + error.message);
    }
  };

  const confirmDelete = async () => {
    if (selectedUserId) {
      try {
        // Excluir usuário no Supabase
        const { error } = await supabase.auth.admin.deleteUser(selectedUserId);
        
        if (error) throw error;
        
        // Atualizar estado local
        setUsers((prev) => prev.filter((user) => user.id !== selectedUserId));
        toast.success("Usuário excluído com sucesso");
      } catch (error: any) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Falha ao excluir usuário: " + error.message);
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedUserId(null);
      }
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
          {loading ? (
            <div className="py-8 text-center">Carregando usuários...</div>
          ) : (
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
                    <td>{user.id.substring(0, 4)}...</td>
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
                    >
                      {user.email}
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
          )}
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
            
            {Array.from({ length: totalPages }).map((_, i) => (
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

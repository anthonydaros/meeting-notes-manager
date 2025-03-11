import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { extractTasksFromText, Task } from "@/integrations/gemini/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

const statusColors = {
  "progress": "bg-blue-100 text-blue-800",
  "complete": "bg-green-100 text-green-800",
  "overdue": "bg-red-100 text-red-800",
};

const statusLabels = {
  "progress": "Em Andamento",
  "complete": "Concluído",
  "overdue": "Atrasado",
};

const Importacao = () => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleImport = async () => {
    if (!text.trim()) {
      toast.error("Por favor, insira um texto para importar.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const tasks = await extractTasksFromText(text);
      setExtractedTasks(tasks);
      toast.success("Planos de ação extraídos com sucesso!");
    } catch (error) {
      console.error("Erro ao processar texto:", error);
      toast.error("Erro ao processar o texto. Por favor, tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTasks = async () => {
    setIsSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error("Usuário não autenticado");
      }

      const userId = session.session.user.id;
      console.log("Iniciando salvamento dos planos de ação para o usuário:", userId);

      // Processar um plano de ação por vez para melhor tratamento de erro
      for (const task of extractedTasks) {
        console.log("Salvando plano de ação:", {
          user_id: userId,
          date_time: new Date(task.dateTime).toISOString(),
          department: task.sector,
          responsible: task.assignee,
          investment: task.investment,
          action: task.action,
          solution: task.solution,
          start_date: new Date(task.startDate).toISOString().split('T')[0],
          end_date: new Date(task.endDate).toISOString().split('T')[0],
          status: task.status
        });

        const { data, error } = await supabase
          .from("action_plans")
          .insert({
            user_id: userId,
            date_time: new Date(task.dateTime).toISOString(),
            department: task.sector,
            responsible: task.assignee,
            investment: task.investment,
            action: task.action,
            solution: task.solution,
            start_date: new Date(task.startDate).toISOString().split('T')[0],
            end_date: new Date(task.endDate).toISOString().split('T')[0],
            status: task.status,
            notes: task.observations || null
          })
          .select()
          .single();

        if (error) {
          console.error("Erro detalhado do Supabase:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw new Error(`Erro ao salvar plano de ação: ${error.message}`);
        }

        console.log("Plano de ação salvo com sucesso:", data);
      }
      
      toast.success("Planos de ação salvos com sucesso!");
      setExtractedTasks([]);
      setText("");
    } catch (error) {
      console.error("Erro ao salvar planos de ação:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao salvar os planos de ação. Por favor, tente novamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Importação
            </h2>
            <p className="text-sm text-muted-foreground">
              Cole o texto de atas de reunião para extrair planos de ação automaticamente
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="importText" className="block text-sm font-medium text-gray-700">
              Texto para importação
            </label>
            <textarea
              id="importText"
              className="w-full h-[300px] p-4 rounded-md border border-input bg-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Cole aqui o texto da ata de reunião ou outros documentos que contenham planos de ação..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="bg-[#333333] text-white hover:bg-[#222222]"
              onClick={handleImport}
              disabled={isProcessing || !text.trim()}
            >
              {isProcessing ? "Processando..." : "Importar Planos de Ação"}
            </Button>
          </div>
        </div>

        {extractedTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-medium">Tarefas Extraídas</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Setor/Responsável</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Solução</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Término</TableHead>
                    <TableHead>Investimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedTasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {format(new Date(task.dateTime), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {task.sector}<br />
                        <span className="text-sm text-gray-500">{task.assignee}</span>
                      </TableCell>
                      <TableCell>{task.action}</TableCell>
                      <TableCell>{task.solution}</TableCell>
                      <TableCell>
                        {format(new Date(task.startDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(task.endDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{task.investment}</TableCell>
                      <TableCell>
                        <Badge
                          className={statusColors[task.status]}
                          variant="secondary"
                        >
                          {statusLabels[task.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const newTasks = [...extractedTasks];
                            newTasks.splice(index, 1);
                            setExtractedTasks(newTasks);
                          }}
                        >
                          <span className="sr-only">Remover</span>
                          ×
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setExtractedTasks([]);
                  setText("");
                }}
              >
                Limpar
              </Button>
              <Button
                className="bg-[#333333] text-white hover:bg-[#222222]"
                onClick={handleSaveTasks}
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Confirmar Importação"}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Como funciona</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              1. Cole o texto completo da ata de reunião ou documento no campo acima.
            </p>
            <p>
              2. Clique em "Importar Planos de Ação" para que nossa inteligência artificial analise o texto.
            </p>
            <p>
              3. A IA identificará automaticamente os planos de ação, responsáveis, prazos e outros detalhes relevantes.
            </p>
            <p>
              4. Revise os planos de ação extraídos e clique em "Confirmar Importação" para adicioná-los ao sistema.
            </p>
            <p className="text-gray-500 italic">
              Nota: A precisão da extração depende da clareza das informações no texto original.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Importacao;

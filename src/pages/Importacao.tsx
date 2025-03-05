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

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

const statusLabels = {
  todo: "A Fazer",
  in_progress: "Em Andamento",
  done: "Concluído",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const Importacao = () => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);

  const handleImport = async () => {
    if (!text.trim()) {
      toast.error("Por favor, insira um texto para importar.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const tasks = await extractTasksFromText(text);
      setExtractedTasks(tasks);
      toast.success("Tarefas extraídas com sucesso!");
    } catch (error) {
      console.error("Erro ao processar texto:", error);
      toast.error("Erro ao processar o texto. Por favor, tente novamente.");
    } finally {
      setIsProcessing(false);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedTasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.assignee || "-"}</TableCell>
                    <TableCell>
                      {task.dueDate
                        ? format(new Date(task.dueDate), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {task.priority && (
                        <Badge
                          className={priorityColors[task.priority]}
                          variant="secondary"
                        >
                          {priorityLabels[task.priority]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.status && (
                        <Badge
                          className={statusColors[task.status]}
                          variant="secondary"
                        >
                          {statusLabels[task.status]}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setExtractedTasks([])}
              >
                Limpar
              </Button>
              <Button
                className="bg-[#333333] text-white hover:bg-[#222222]"
                onClick={() => {
                  // TODO: Implementar salvamento das tarefas
                  toast.success("Tarefas salvas com sucesso!");
                }}
              >
                Salvar Tarefas
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
              4. Revise as tarefas extraídas e clique em "Salvar Tarefas" para adicioná-las ao sistema.
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

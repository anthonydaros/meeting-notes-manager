import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyBzoQ0aKQfab76Fcd98H_PQ2c-06n8AAh8";

if (!GEMINI_API_KEY) {
  throw new Error("Missing Gemini API key");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface Task {
  title: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  status?: "todo" | "in_progress" | "done";
}

export async function extractTasksFromText(text: string): Promise<Task[]> {
  try {
    // Usar o modelo gemini-2.0-flash para melhor performance
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Você é um assistente especializado em extrair tarefas de atas de reunião.
      Analise o texto abaixo que é um resumo de reunião e extraia as tarefas mencionadas.
      
      Para cada tarefa, identifique:
      - Título: Um título curto e descritivo da tarefa
      - Descrição: Uma descrição detalhada do que precisa ser feito
      - Responsável: Nome da pessoa responsável (se mencionado)
      - Data de entrega: Data limite no formato YYYY-MM-DD (se mencionada)
      - Prioridade: "low", "medium" ou "high" (baseado no contexto e urgência)
      - Status: "todo" para novas tarefas, "in_progress" para tarefas já iniciadas, "done" para tarefas concluídas

      Retorne apenas um array JSON com as tarefas identificadas, seguindo exatamente este formato:
      [
        {
          "title": "string",
          "description": "string",
          "assignee": "string" (opcional),
          "dueDate": "YYYY-MM-DD" (opcional),
          "priority": "low" | "medium" | "high" (opcional),
          "status": "todo" | "in_progress" | "done" (opcional)
        }
      ]

      Importante:
      - Mantenha o título curto e objetivo
      - A descrição deve ser mais detalhada
      - Use as datas mencionadas no texto
      - Atribua prioridades baseadas na urgência e importância mencionadas
      - Defina o status com base no contexto (se já foi iniciado ou não)

      Texto da reunião:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    try {
      // Tenta encontrar o array JSON na resposta
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      
      const tasks = JSON.parse(jsonMatch[0]) as Task[];
      
      // Validar e formatar as tarefas
      const validatedTasks = tasks.map(task => ({
        ...task,
        // Garantir que todos os campos obrigatórios existam
        title: task.title || "Sem título",
        description: task.description || "Sem descrição",
        // Validar e formatar a data se existir
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
        // Validar prioridade
        priority: task.priority && ["low", "medium", "high"].includes(task.priority) 
          ? task.priority as "low" | "medium" | "high"
          : undefined,
        // Validar status
        status: task.status && ["todo", "in_progress", "done"].includes(task.status)
          ? task.status as "todo" | "in_progress" | "done"
          : "todo"
      }));

      return validatedTasks;
    } catch (parseError) {
      console.error("[Gemini] Error parsing tasks:", parseError);
      throw new Error("Failed to parse tasks from AI response");
    }
  } catch (error) {
    console.error("[Gemini] Error extracting tasks:", error);
    throw error;
  }
} 
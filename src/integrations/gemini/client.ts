import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyBzoQ0aKQfab76Fcd98H_PQ2c-06n8AAh8";

if (!GEMINI_API_KEY) {
  throw new Error("Missing Gemini API key");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface Task {
  dateTime: string;
  sector: string;
  assignee: string;
  investment: string;
  action: string;
  solution: string;
  startDate: string;
  endDate: string;
  status: "progress" | "complete" | "overdue";
  observations?: string;
}

export async function extractTasksFromText(text: string): Promise<Task[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Você é um assistente especializado em extrair planos de ação de atas de reunião.
      Analise o texto abaixo que é um resumo de reunião e extraia os planos de ação mencionados.
      
      Para cada plano de ação, identifique:
      - Data e Hora: Data e hora da criação no formato YYYY-MM-DD HH:mm
      - Setor: Setor responsável
      - Responsável: Nome da pessoa responsável
      - Investimento: Valor do investimento necessário (se mencionado)
      - Ação: Descrição da ação a ser tomada
      - Solução: Solução proposta
      - Início: Data de início no formato YYYY-MM-DD
      - Término: Data de término no formato YYYY-MM-DD
      - Status: Status atual ("progress" para em andamento, "complete" para concluído, "overdue" para atrasado)
      - Observações: Observações adicionais (opcional)

      Retorne apenas um array JSON com os planos de ação identificados, seguindo exatamente este formato:
      [
        {
          "dateTime": "YYYY-MM-DD HH:mm",
          "sector": "string",
          "assignee": "string",
          "investment": "string",
          "action": "string",
          "solution": "string",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "status": "progress" | "complete" | "overdue",
          "observations": "string" (opcional)
        }
      ]

      Importante:
      - Use o formato de data e hora especificado
      - Extraia o setor do contexto quando possível
      - O investimento deve incluir a moeda quando mencionado
      - A ação deve ser clara e objetiva
      - A solução deve detalhar como a ação será executada
      - Use as datas mencionadas no texto para início e término
      - O status deve ser um dos três valores: "progress", "complete", "overdue"
      - Inclua observações relevantes quando disponíveis

      Texto da reunião:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    try {
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      
      const tasks = JSON.parse(jsonMatch[0]) as Task[];
      
      const validatedTasks = tasks.map(task => {
        // Função auxiliar para validar e formatar data
        const validateDate = (dateStr: string, defaultDate = new Date()) => {
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              return defaultDate;
            }
            return date;
          } catch {
            return defaultDate;
          }
        };

        // Validar e formatar a data e hora atual
        const now = new Date();
        const dateTime = validateDate(task.dateTime, now);
        const startDate = validateDate(task.startDate, now);
        const endDate = validateDate(task.endDate, now);

        // Mapear status antigos para os novos
        const mapStatus = (status: string): "progress" | "complete" | "overdue" => {
          switch (status.toLowerCase()) {
            case "em andamento":
            case "a fazer":
            case "progress":
              return "progress";
            case "concluído":
            case "complete":
              return "complete";
            case "atrasado":
            case "overdue":
              return "overdue";
            default:
              return "progress";
          }
        };

        return {
          dateTime: dateTime.toISOString(),
          sector: task.sector || "Não especificado",
          assignee: task.assignee || "Não especificado",
          investment: task.investment || "Não especificado",
          action: task.action || "Não especificado",
          solution: task.solution || "Não especificado",
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: mapStatus(task.status),
          observations: task.observations
        };
      });

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
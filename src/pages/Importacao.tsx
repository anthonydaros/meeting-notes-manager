
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Importacao = () => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = () => {
    if (!text.trim()) {
      alert("Por favor, insira um texto para importar.");
      return;
    }

    setIsProcessing(true);
    
    // Simulação de processamento
    setTimeout(() => {
      console.log("Texto a ser processado pela IA:", text);
      // Aqui entraria a lógica de integração com a IA para processamento do texto
      
      setIsProcessing(false);
      // Feedback de sucesso
      alert("Importação realizada com sucesso! Os planos de ação foram criados.");
      setText("");
    }, 1500);
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
              className="w-full h-[600px] p-4 rounded-md border border-input bg-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
              4. Os planos de ação identificados serão adicionados à lista geral de planos.
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

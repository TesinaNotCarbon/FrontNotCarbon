import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  showFunFact?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = "Loading...",
  showFunFact = true,
}) => {
  const [funFact, setFunFact] = useState<string>("");

  const funFacts = [
    "🌱 Loading project data from the blockchain...",
    "🔗 Connecting to Ethereum network...",
    "📊 Did you know? Carbon credits help offset greenhouse gas emissions",
    "🌍 Fun fact: One carbon credit equals one metric ton of CO2 reduced",
    "♻️ Blockchain technology ensures transparent carbon credit trading",
    "🌳 Reforestation projects can generate valuable carbon credits",
    "⚡ Renewable energy projects are major carbon credit generators",
    "🏭 Industrial companies buy carbon credits to achieve net-zero goals",
    "📈 The carbon credit market is growing rapidly worldwide",
    "🔒 Smart contracts ensure secure and transparent transactions",
    "🌿 Every carbon credit purchase supports environmental projects",
    "💚 Your participation helps fight climate change",
  ];

  useEffect(() => {
    if (!isLoading) return;

    let index = 0;
    setFunFact(funFacts[index]);
    const funFactInterval = setInterval(() => {
      index = (index + 1) % funFacts.length;
      setFunFact(funFacts[index]);
    }, 3000); // 3 segundos

    return () => clearInterval(funFactInterval);
  }, [isLoading]);

  if (!isLoading) return null;

  // Crear un portal en el body si no existe loading-root
  const loadingRoot = document.getElementById("loading-root") || document.body;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center mb-8">
        {/* Contenedor centrado para el círculo de carga */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Icono de blockchain/leaf animado */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse z-10">
            <span className="text-3xl">🌱</span>
          </div>
          
          {/* Anillo giratorio centrado */}
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-green-400 rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Texto principal */}
      <span className="text-white text-xl font-semibold mb-4">{text}</span>
      
      {/* Datos curiosos */}
      {showFunFact && (
        <div className="max-w-md text-center">
          <span className="text-green-300 font-medium text-base animate-pulse">
            {funFact}
          </span>
        </div>
      )}
    </div>,
    loadingRoot
  );
};

export default LoadingOverlay;

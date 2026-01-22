// CardRevealAnimation.tsx - Animação de abertura estilo FIFA
import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

type Props = {
  children: React.ReactNode;
  onRevealComplete?: () => void;
  autoPlay?: boolean;
  rarity?: "common" | "rare" | "epic" | "legendary";
};

export default function CardRevealAnimation({
  children,
  onRevealComplete,
  autoPlay = false,
  rarity = "rare",
}: Props) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cores por raridade
  const rarityColors = {
    common: {
      primary: "#94a3b8",
      secondary: "#64748b",
      glow: "rgba(148, 163, 184, 0.5)",
    },
    rare: {
      primary: "#3b82f6",
      secondary: "#2563eb",
      glow: "rgba(59, 130, 246, 0.8)",
    },
    epic: {
      primary: "#a855f7",
      secondary: "#9333ea",
      glow: "rgba(168, 85, 247, 0.8)",
    },
    legendary: {
      primary: "#f59e0b",
      secondary: "#d97706",
      glow: "rgba(245, 158, 11, 1)",
    },
  };

  const colors = rarityColors[rarity];

  useEffect(() => {
    if (autoPlay) {
      setTimeout(() => startReveal(), 500);
    }
  }, [autoPlay]);

  const startReveal = () => {
    setIsRevealing(true);

    // Toca som de celebração
    if (soundEnabled) {
      playSound();
    }

    // Sequência de animação
    setTimeout(() => {
      setIsRevealed(true);
      setTimeout(() => {
        onRevealComplete?.();
      }, 1000);
    }, 2500);
  };

  const playSound = () => {
    // Usando Web Audio API para criar som de celebração
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Som de "whoosh" inicial
      const whooshOsc = audioContext.createOscillator();
      const whooshGain = audioContext.createGain();
      whooshOsc.connect(whooshGain);
      whooshGain.connect(audioContext.destination);
      
      whooshOsc.frequency.setValueAtTime(800, audioContext.currentTime);
      whooshOsc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
      whooshGain.gain.setValueAtTime(0.3, audioContext.currentTime);
      whooshGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      whooshOsc.start(audioContext.currentTime);
      whooshOsc.stop(audioContext.currentTime + 0.3);

      // Som de "ding" de revelação
      setTimeout(() => {
        const dingOsc = audioContext.createOscillator();
        const dingGain = audioContext.createGain();
        dingOsc.connect(dingGain);
        dingGain.connect(audioContext.destination);
        
        dingOsc.frequency.setValueAtTime(1200, audioContext.currentTime);
        dingGain.gain.setValueAtTime(0.4, audioContext.currentTime);
        dingGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        dingOsc.start(audioContext.currentTime);
        dingOsc.stop(audioContext.currentTime + 0.5);
      }, 1500);

      // Acorde de celebração
      setTimeout(() => {
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G (acorde de Dó maior)
        frequencies.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
          
          osc.start(audioContext.currentTime + i * 0.05);
          osc.stop(audioContext.currentTime + 1);
        });
      }, 2000);
    } catch (error) {
      console.log("Audio not supported");
    }
  };

  if (!isRevealing && !isRevealed) {
    return (
      <div className="relative">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
        `}</style>

        <div className="flex flex-col items-center gap-6">
          {/* Controle de som */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-600/50 transition-all"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={18} className="text-green-400" />
                <span className="text-sm text-white font-medium">Som Ativado</span>
              </>
            ) : (
              <>
                <VolumeX size={18} className="text-gray-400" />
                <span className="text-sm text-gray-400 font-medium">Som Desativado</span>
              </>
            )}
          </button>

          {/* Card misterioso flutuante */}
          <div 
            className="relative cursor-pointer group"
            onClick={startReveal}
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            <div 
              className="w-64 h-96 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 60px ${colors.glow}, 0 20px 40px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Padrão de fundo animado */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
                }}
              />
              
              {/* Símbolo de interrogação */}
              <div className="text-white text-9xl font-black opacity-80 group-hover:scale-110 transition-transform">
                ?
              </div>

              {/* Partículas flutuantes */}
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>

              {/* Brilho hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Texto de instrução */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="flex items-center gap-2 text-white font-bold text-sm bg-slate-800/80 px-4 py-2 rounded-full border border-slate-600/50">
                <Sparkles size={16} className="text-yellow-400" />
                Clique para revelar
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRevealing && !isRevealed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <style>{`
          @keyframes revealSpin {
            0% { transform: perspective(1000px) rotateY(0deg) scale(0.8); }
            50% { transform: perspective(1000px) rotateY(180deg) scale(1.2); }
            100% { transform: perspective(1000px) rotateY(360deg) scale(1); }
          }

          @keyframes particleExplosion {
            0% { 
              transform: translate(0, 0) scale(0);
              opacity: 1;
            }
            100% { 
              transform: translate(var(--tx), var(--ty)) scale(1);
              opacity: 0;
            }
          }

          @keyframes lightRay {
            0% { 
              transform: rotate(0deg) scaleY(0);
              opacity: 0.8;
            }
            50% {
              transform: rotate(180deg) scaleY(1);
              opacity: 0.4;
            }
            100% { 
              transform: rotate(360deg) scaleY(0);
              opacity: 0;
            }
          }

          @keyframes pulseGlow {
            0%, 100% { 
              box-shadow: 0 0 40px ${colors.glow},
                          0 0 80px ${colors.glow},
                          0 0 120px ${colors.glow};
            }
            50% { 
              box-shadow: 0 0 60px ${colors.glow},
                          0 0 120px ${colors.glow},
                          0 0 180px ${colors.glow};
            }
          }
        `}</style>

        {/* Raios de luz rotativos */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-full origin-bottom"
              style={{
                transform: `rotate(${i * 45}deg)`,
                animation: "lightRay 2s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div 
                className="w-full h-full"
                style={{
                  background: `linear-gradient(to top, ${colors.glow}, transparent)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Card girando */}
        <div 
          className="relative z-10"
          style={{
            animation: "revealSpin 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div 
            className="rounded-3xl overflow-hidden"
            style={{
              animation: "pulseGlow 1s ease-in-out infinite",
            }}
          >
            {children}
          </div>
        </div>

        {/* Explosão de partículas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(40)].map((_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const distance = 200 + Math.random() * 300;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            return (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
                  animation: "particleExplosion 1.5s ease-out forwards",
                  animationDelay: `${1 + Math.random() * 0.5}s`,
                  // @ts-ignore
                  "--tx": `${tx}px`,
                  "--ty": `${ty}px`,
                }}
              />
            );
          })}
        </div>

        {/* Texto de raridade */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <div 
            className="text-4xl font-black uppercase tracking-wider animate-pulse"
            style={{
              color: colors.primary,
              textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
            }}
          >
            {rarity}!
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
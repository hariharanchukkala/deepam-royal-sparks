import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../types';

interface EffectSimulationModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export const EffectSimulationModal: React.FC<EffectSimulationModalProps> = ({
  product,
  isOpen,
  onClose,
  onAdd
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [currentShot, setCurrentShot] = useState<number>(1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Play subtle gentle low-thud crackle using Web Audio API
  const playThudSound = () => {
    if (isAudioMuted) return;
    try {
      const ctx = audioContext || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Low bass thud (85Hz down to 40Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 380;
    canvas.height = canvas.parentElement?.clientHeight || 420;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
    }

    let particles: Particle[] = [];
    const colors = ['#f8ebe5', '#fece57', '#eec14b', '#ffdadc', '#ff5252', '#ffd700'];

    const spawnBurst = (x: number, y: number) => {
      const pCount = 50;
      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.5, // slight gravity
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 2,
          decay: 0.012 + Math.random() * 0.015
        });
      }
      playThudSound();
    };

    let frameCount = 0;
    const loop = () => {
      frameCount++;
      ctx.fillStyle = 'rgba(20, 10, 15, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && frameCount % 28 === 0) {
        const bx = canvas.width * 0.2 + Math.random() * canvas.width * 0.6;
        const by = canvas.height * 0.2 + Math.random() * canvas.height * 0.4;
        spawnBurst(bx, by);
        setCurrentShot((prev) => (prev >= 50 ? 1 : prev + 1));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, isPlaying, isAudioMuted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#201a16] text-[#fff8f5] rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-3 bg-[#362f2b] flex items-center justify-between border-b border-[#554243]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#128C7E] animate-ping"></span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#fece57]">
                4K Studio Calibration
              </span>
              <h3 className="font-playfair text-sm font-semibold truncate max-w-[240px]">
                {product.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Visual Simulation Canvas Frame */}
        <div className="relative w-full h-72 bg-gradient-to-b from-[#0c0508] via-[#1a0c12] to-[#25101a] overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Overlay Spec HUD */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono border border-white/10">
            Shot: <span className="text-[#fece57] font-bold">{currentShot}/50</span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white/90 hover:text-white border border-white/10 text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isAudioMuted ? 'volume_off' : 'volume_up'}
              </span>
              <span className="font-mono text-[10px]">
                {product.soundDb !== undefined ? `${product.soundDb} dB` : product.soundLevel}
              </span>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-black/60 backdrop-blur-md p-1.5 rounded-full text-white/90 hover:text-white border border-white/10"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md p-2 rounded-lg border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-[#fece57] font-bold block text-[11px]">
                {product.visualEffect}
              </span>
              <span className="text-white/70 text-[10px]">
                Canopy: {product.altitude} • Duration: {product.duration}
              </span>
            </div>
            <span className="text-[10px] bg-[#133a27] text-[#c2edd0] px-2 py-0.5 rounded font-bold">
              CSIR-NEERI Green
            </span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-[#362f2b] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase text-[#dbc0c1] font-semibold block">Price</span>
            <span className="font-playfair text-lg font-bold text-[#fece57]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            onClick={() => {
              onAdd();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-[#661023] hover:bg-[#450011] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">local_mall</span>
            <span>Add to Festival Hamper</span>
          </button>
        </div>
      </div>
    </div>
  );
};

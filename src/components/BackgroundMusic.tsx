import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Synthesized timers
  const playTimer1 = useRef<NodeJS.Timeout | any>(null);
  const playTimer2 = useRef<NodeJS.Timeout | any>(null);

  const initSynthesizer = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Ramp sound safely
      masterGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2.0);

      // Start beautiful organic procedural ambient drone loop
      startAmbientLoop(ctx, masterGain);
    } catch (err) {
      console.error("Web Audio API not supported", err);
    }
  };

  const startAmbientLoop = (ctx: AudioContext, destination: AudioNode) => {
    // We create warm, low frequency drones that sound like ancient drums/calming breeze
    const playDrone = (freq: number, type: OscillatorType, gainVal: number, delayStart: number, duration: number) => {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") return;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const oscGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delayStart);
      
      // Detune slightly for lush thickness
      osc.detune.setValueAtTime(Math.random() * 8 - 4, ctx.currentTime + delayStart);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime + delayStart);
      filter.Q.setValueAtTime(1.2, ctx.currentTime + delayStart);

      oscGain.gain.setValueAtTime(0, ctx.currentTime + delayStart);
      oscGain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + delayStart + 1.5);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delayStart + duration - 0.5);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(destination);

      osc.start(ctx.currentTime + delayStart);
      osc.stop(ctx.currentTime + delayStart + duration);
    };

    // Low deep warm drone (Base harmonic C2 approx 65Hz / Ab2 approx 103Hz)
    const runLoungePads = () => {
      if (!isPlaying && audioCtxRef.current && audioCtxRef.current.state === "suspended") return;
      
      // Gentle drone (Adjusted gain slightly for rich warmth)
      playDrone(65.4, "triangle", 0.5, 0, 12);
      playDrone(98.0, "sine", 0.4, 2, 10);
      playDrone(130.8, "sine", 0.25, 4, 8);

      // Random gentle "African wood block / Kalimba" bell chiming
      // Chimes in high frequency pentatonic scale (C4, Eb4, F4, G4, Bb4, C5)
      const scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25];
      for (let i = 0; i < 4; i++) {
        const toneFreq = scale[Math.floor(Math.random() * scale.length)];
        const delay = 1 + Math.random() * 8;
        const dur = 4 + Math.random() * 3;
        playDrone(toneFreq, "sine", 0.15, delay, dur);
      }

      // Schedule next generation block
      playTimer1.current = setTimeout(runLoungePads, 11000);
    };

    runLoungePads();
  };

  const handleToggle = async () => {
    if (!audioCtxRef.current) {
      initSynthesizer();
      setIsPlaying(true);
      return;
    }

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.25, audioCtxRef.current.currentTime + 1.5);
      }
      setIsPlaying(true);
    } else if (audioCtxRef.current.state === "running" && isPlaying) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.0, audioCtxRef.current.currentTime + 1.0);
      }
      setTimeout(() => {
        if (!isPlaying && audioCtxRef.current && audioCtxRef.current.state === "running") {
          audioCtxRef.current.suspend();
        }
      }, 1100);
      setIsPlaying(false);
    } else {
      await audioCtxRef.current.resume();
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.25, audioCtxRef.current.currentTime + 1.0);
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (playTimer1.current) clearTimeout(playTimer1.current);
      if (playTimer2.current) clearTimeout(playTimer2.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      id="ambient-sound-widget"
      className="fixed bottom-6 left-6 z-40 bg-black/95 border border-gold-300/10 rounded-none px-3 py-2.5 flex items-center gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)] luxury-glow text-xs font-sans text-gray-400 group focus-within:border-gold-400 transition-colors"
    >
      {/* Wave animation */}
      <div className="flex items-end gap-0.5 h-4 w-5">
        {[2, 4, 3, 5, 1].map((bar, i) => (
          <span
            key={i}
            style={{
              height: isPlaying ? `${bar * 20}%` : "15%",
              animationName: isPlaying ? "bounce" : "none",
              animationDuration: "1s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              animationDelay: `${i * 0.15}s`,
            }}
            className="w-0.5 bg-gold-400 opacity-60 rounded-full transition-all duration-300"
          />
        ))}
      </div>

      <div className="flex flex-col text-left">
        <span className="text-[10px] uppercase tracking-[0.1em] text-gold-400/80 font-sans font-light">Lounge Ambient</span>
        <button
          onClick={handleToggle}
          className="text-[11px] font-sans text-[#fbf9f4] hover:text-gold-300 transition-colors flex items-center gap-1.5 focus:outline-none"
        >
          {isPlaying ? (
            <>
              <span>Ona Rhythms Live</span>
              <Volume2 className="w-3.5 h-3.5 text-gold-400" />
            </>
          ) : (
            <>
              <span>Unmute Soundscape</span>
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0% { height: 15%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}

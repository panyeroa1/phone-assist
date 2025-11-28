
import React, { useEffect, useRef, useState } from 'react';
import { Icons, RINGING_AUDIO_URL } from '../constants';
import { CallState, Persona } from '../types';
import { GeminiLiveService } from '../services/geminiService';
import { GENERAL_SYSTEM_PROMPT } from '../data/personas';

interface CallScreenProps {
  name: string;
  number: string;
  callState: CallState;
  onEndCall: () => void;
  setCallState: (state: CallState) => void;
  activePersona?: Persona;
}

const CallScreen: React.FC<CallScreenProps> = ({ name, number, callState, onEndCall, setCallState, activePersona }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const ringAudioRef = useRef<HTMLAudioElement | null>(null);
  const geminiServiceRef = useRef<GeminiLiveService | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize Ringing
  useEffect(() => {
    if (callState === CallState.RINGING) {
      ringAudioRef.current = new Audio(RINGING_AUDIO_URL);
      ringAudioRef.current.loop = false; // Play once or loop? Request implies a 9s play then connect
      ringAudioRef.current.play().catch(err => console.error("Audio playback error:", err));

      // Auto connect after ringing (simulating the other side picking up)
      // The audio is about 9s. Let's wait 8.5s then connect.
      const pickupTimer = setTimeout(() => {
        handleConnect();
      }, 9000); 

      return () => {
        clearTimeout(pickupTimer);
        if (ringAudioRef.current) {
          ringAudioRef.current.pause();
          ringAudioRef.current = null;
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState]);

  // Connect to Gemini
  const handleConnect = async () => {
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
    }
    setCallState(CallState.CONNECTING);
    setIsSpeaker(false); // Default to earpiece
    
    geminiServiceRef.current = new GeminiLiveService({
      apiKey: process.env.API_KEY || '',
      onAudioData: (base64) => {
        // Visualizer kick
        setAudioLevel(prev => (prev === 0 ? 1 : 0.8));
        setTimeout(() => setAudioLevel(0), 150);
      },
      onClose: () => {
        onEndCall();
      },
      onError: () => {
        // Fallback or alert
        onEndCall();
      }
    });

    // Construct system prompt by replacing placeholders
    let systemInstruction = "You are a friendly phone assistant.";
    let voiceName = 'Kore';

    if (activePersona) {
      systemInstruction = GENERAL_SYSTEM_PROMPT
        .replace(/{{PERSONA_NAME}}/g, activePersona.name)
        .replace(/{{PERSONA_ROLE}}/g, activePersona.role)
        .replace(/{{PERSONA_DETAILS}}/g, activePersona.details);
      
      voiceName = activePersona.voiceName;
    }

    await geminiServiceRef.current.connect({
      voiceName,
      systemInstruction
    });
    setCallState(CallState.ACTIVE);
  };

  // Timer for Active Call
  useEffect(() => {
    if (callState === CallState.ACTIVE) {
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (geminiServiceRef.current) {
        geminiServiceRef.current.disconnect();
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => setIsMuted(!isMuted);
  
  const toggleSpeaker = () => {
    const newState = !isSpeaker;
    setIsSpeaker(newState);
    if (geminiServiceRef.current) {
        // 0.2 = Earpiece (Low), 1.0 = Speaker (High)
        geminiServiceRef.current.setVolume(newState ? 1.0 : 0.2);
    }
  };

  const StatusDisplay = () => {
    if (callState === CallState.RINGING) return <div className="text-white/90 text-sm mb-6 animate-pulse">Calling...</div>;
    if (callState === CallState.CONNECTING) return <div className="text-white/90 text-sm mb-6">Connecting...</div>;
    if (callState === CallState.ACTIVE) return <div className="text-white/90 text-sm mb-6">{formatTime(duration)}</div>;
    return <div className="text-white/90 text-sm mb-6">Ended</div>;
  };

  // Visualization Pulse
  const pulseScale = callState === CallState.ACTIVE && audioLevel > 0 ? 1.2 : 1;
  const avatarColor = activePersona?.avatarColor || 'bg-white/20';
  const avatarChar = activePersona?.name?.charAt(0) || name.charAt(0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center pt-20 text-white bg-[linear-gradient(170deg,#151020_0%,#2a1a25_50%,#5e3b3b_100%)]">
      
      {/* Header Info */}
      <StatusDisplay />
      
      <div className="flex flex-col items-center mb-8 relative">
        <h2 className="text-4xl font-semibold mb-2">{name}</h2>
        <p className="text-base opacity-80">{number}</p>
        
        {/* Simple Avatar/Visualizer */}
        <div className="mt-12 w-32 h-32 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-100" style={{ transform: `scale(${pulseScale})` }}>
            <div className={`w-24 h-24 rounded-full ${activePersona ? activePersona.avatarColor : 'bg-white/20'} flex items-center justify-center`}>
                 <span className="text-4xl font-bold">{avatarChar}</span>
            </div>
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Controls Grid */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-8 w-[85%] mb-12">
        <button className="flex flex-col items-center gap-2 group" onClick={toggleMute}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
             <Icons.Mute />
          </div>
          <span className="text-xs opacity-90">Mute</span>
        </button>
        
        <button className="flex flex-col items-center gap-2">
           <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
             <div className="grid grid-cols-3 gap-[2px] w-5 h-5 opacity-80">
                {[...Array(9)].map((_, i) => <div key={i} className="bg-white rounded-full"></div>)}
             </div>
           </div>
           <span className="text-xs opacity-90">Keypad</span>
        </button>

        <button className="flex flex-col items-center gap-2" onClick={toggleSpeaker}>
           <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${isSpeaker ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
             <Icons.Speaker />
           </div>
           <span className="text-xs opacity-90">Speaker</span>
        </button>

        <button className="flex flex-col items-center gap-2">
           <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
              <span className="text-xl font-medium">+</span>
           </div>
           <span className="text-xs opacity-90">Add call</span>
        </button>

        <button className="flex flex-col items-center gap-2">
           <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
             <Icons.Video />
           </div>
           <span className="text-xs opacity-90">Video call</span>
        </button>

        <button className="flex flex-col items-center gap-2">
           <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
             <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-[10px]">i</div>
           </div>
           <span className="text-xs opacity-90">Contacts</span>
        </button>
      </div>

      {/* End Call */}
      <div className="mb-16">
        <button 
          className="w-[72px] h-[72px] bg-[#ff3b30] rounded-full flex justify-center items-center shadow-[0_4px_15px_rgba(255,59,48,0.4)] hover:bg-red-600 transition-colors"
          onClick={onEndCall}
        >
          <Icons.EndCall />
        </button>
      </div>

    </div>
  );
};

export default CallScreen;

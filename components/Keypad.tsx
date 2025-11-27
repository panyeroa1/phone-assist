import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

interface KeypadProps {
  onCallStart: (number: string) => void;
  onNumberChange: (number: string) => void;
  onAddNumber: () => void;
  initialNumber?: string;
}

const DTMF_FREQUENCIES: Record<string, number[]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
};

const Keypad: React.FC<KeypadProps> = ({ onCallStart, onNumberChange, onAddNumber, initialNumber = "" }) => {
  const [currentNumber, setCurrentNumber] = useState(initialNumber);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastInputTimeRef = useRef<number>(0);

  useEffect(() => {
    onNumberChange(currentNumber);
  }, [currentNumber, onNumberChange]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (key: string) => {
    initAudio();
    if (!audioCtxRef.current || !DTMF_FREQUENCIES[key]) return;
    
    const [f1, f2] = DTMF_FREQUENCIES[key];
    const osc1 = audioCtxRef.current.createOscillator();
    const osc2 = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    osc1.frequency.value = f1;
    osc2.frequency.value = f2;
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    
    gainNode.gain.value = 0.1;
    
    osc1.start();
    osc2.start();
    
    setTimeout(() => {
      osc1.stop();
      osc2.stop();
    }, 150);
  };

  const handleKeyPress = (key: string) => {
    const now = Date.now();
    // Debounce: prevent inputs faster than 150ms to avoid double-taps
    if (now - lastInputTimeRef.current < 150) return;
    
    lastInputTimeRef.current = now;
    playTone(key);
    
    if (currentNumber.length < 20) {
      setCurrentNumber(prev => prev + key);
    }
  };

  const handleDelete = () => {
    setCurrentNumber(prev => prev.slice(0, -1));
  };

  const handleLongPress0 = () => {
    setCurrentNumber(prev => {
      if (prev.endsWith('0')) return prev.slice(0, -1) + '+';
      return prev;
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Render a single key
  const Key = ({ val, sub, onLongPress }: { val: string, sub?: React.ReactNode, onLongPress?: () => void }) => {
    const timerRef = useRef<number | null>(null);
    const [isActive, setIsActive] = useState(false);

    const start = () => {
        setIsActive(true);
        handleKeyPress(val);
        if (onLongPress) {
            timerRef.current = window.setTimeout(onLongPress, 800);
        }
    };
    
    const end = () => {
        setIsActive(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
      <button
        className={`flex flex-col items-center justify-center h-[78px] w-[78px] rounded-full transition-colors outline-none select-none duration-100 ${isActive ? 'bg-[#e5e5e5]' : 'bg-[#f2f2f2]'} `}
        onMouseDown={start}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => { e.preventDefault(); start(); }}
        onTouchEnd={(e) => { e.preventDefault(); end(); }}
      >
        <span className="text-[34px] font-normal leading-none text-black pointer-events-none mb-[-4px]">{val}</span>
        {sub && (
             <span className="text-[9px] text-black font-semibold uppercase tracking-[2px] h-3 pointer-events-none">
             {sub}
           </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white pb-32 pt-6">
      {/* Display */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-[100px] text-black mb-4">
        <div className="text-[40px] font-normal tracking-tight min-h-[50px] leading-tight px-8 text-center break-all">
          {currentNumber}
        </div>
        {currentNumber.length > 0 && (
            <button 
              className="text-blue-500 text-[17px] font-medium mt-2 active:opacity-50 transition-opacity"
              onClick={onAddNumber}
            >
              Add Number
            </button>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 px-8 items-center">
            <div className="flex gap-6 justify-center w-full">
                <Key val="1" sub="" />
                <Key val="2" sub="ABC" />
                <Key val="3" sub="DEF" />
            </div>
            <div className="flex gap-6 justify-center w-full">
                <Key val="4" sub="GHI" />
                <Key val="5" sub="JKL" />
                <Key val="6" sub="MNO" />
            </div>
            <div className="flex gap-6 justify-center w-full">
                <Key val="7" sub="PQRS" />
                <Key val="8" sub="TUV" />
                <Key val="9" sub="WXYZ" />
            </div>
             <div className="flex gap-6 justify-center w-full">
                <Key val="*" sub="" />
                <Key val="0" sub="+" onLongPress={handleLongPress0} />
                <Key val="#" sub="" />
            </div>
        </div>

        {/* Action Area */}
        <div className="flex justify-center items-center relative h-24 mt-4">
          <button 
            className="w-[65px] h-[65px] bg-[#34c759] rounded-full flex justify-center items-center shadow-md active:bg-[#2db550] transition-colors"
            onClick={() => onCallStart(currentNumber)}
          >
            <Icons.Call className="w-[32px] h-[32px] fill-white" />
          </button>
          
          {currentNumber.length > 0 && (
            <button 
              className="absolute right-[15%] p-4 text-gray-300 active:text-gray-500 transition-colors"
              onClick={handleDelete}
            >
              <Icons.Delete />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Keypad;
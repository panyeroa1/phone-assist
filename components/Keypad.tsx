import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

interface KeypadProps {
  onCallStart: (number: string) => void;
  onNumberChange: (number: string) => void;
  initialNumber?: string;
}

const DTMF_FREQUENCIES: Record<string, number[]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
};

const Keypad: React.FC<KeypadProps> = ({ onCallStart, onNumberChange, initialNumber = "" }) => {
  const [currentNumber, setCurrentNumber] = useState(initialNumber);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

    const start = () => {
        handleKeyPress(val);
        if (onLongPress) {
            timerRef.current = window.setTimeout(onLongPress, 800);
        }
    };
    
    const end = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
      <button
        className="flex flex-col items-center justify-center h-[70px] w-full rounded-full active:bg-[#f2f2f2] transition-colors outline-none select-none"
        onMouseDown={start}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => { e.preventDefault(); start(); }}
        onTouchEnd={end}
      >
        <span className="text-4xl font-light leading-none text-black pointer-events-none">{val}</span>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider h-3 pointer-events-none mt-1">
          {sub}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white pb-28">
      {/* Header handled by parent or empty here for spacing */}
      <div className="h-16 shrink-0 flex items-center justify-end px-6">
        <div className="flex gap-6">
            <button className="text-black"><Icons.Search /></button>
            <button className="text-black"><Icons.Menu /></button>
        </div>
      </div>

      {/* Display */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-[100px] text-black">
        <div className="text-[42px] font-normal tracking-wide min-h-[50px]">
          {currentNumber}
        </div>
        {currentNumber.length === 0 && (
            <div className="text-sm text-gray-400 mt-2">Enter a number</div>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-y-4 px-10 mb-4">
          <Key val="1" sub={<div className="scale-75"><Icons.Voicemail /></div>} />
          <Key val="2" sub="ABC" />
          <Key val="3" sub="DEF" />
          <Key val="4" sub="GHI" />
          <Key val="5" sub="JKL" />
          <Key val="6" sub="MNO" />
          <Key val="7" sub="PQRS" />
          <Key val="8" sub="TUV" />
          <Key val="9" sub="WXYZ" />
          <Key val="*" sub="" />
          <Key val="0" sub="+" onLongPress={handleLongPress0} />
          <Key val="#" sub="" />
        </div>

        {/* Action Area */}
        <div className="flex justify-center items-center relative h-20 pb-5">
          <button 
            className="w-[65px] h-[65px] bg-[#00c748] rounded-full flex justify-center items-center shadow-lg active:scale-95 transition-transform"
            onClick={() => onCallStart(currentNumber)}
          >
            <Icons.Call />
          </button>
          
          {currentNumber.length > 0 && (
            <button 
              className="absolute right-[20%] p-4 animate-fade-in"
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
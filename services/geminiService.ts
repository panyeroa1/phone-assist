import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface LiveConfig {
  apiKey: string;
  onAudioData: (base64Audio: string) => void;
  onClose: () => void;
  onError: (error: any) => void;
}

interface ConnectOptions {
  voiceName?: string;
  systemInstruction?: string;
}

export class GeminiLiveService {
  private client: GoogleGenAI;
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private audioStream: MediaStream | null = null;
  private nextStartTime = 0;
  private config: LiveConfig;
  private isConnected = false;

  constructor(config: LiveConfig) {
    this.config = config;
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async connect(options?: ConnectOptions) {
    if (this.isConnected) return;

    // 1. Setup Audio Output Context
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // 2. Setup Audio Input Context
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    // 3. Connect to Live API
    try {
      // Append instruction to speak first
      const userInstruction = options?.systemInstruction || "You are a friendly, helpful, and concise phone assistant.";
      const finalInstruction = `${userInstruction}\n\nIMPORTANT: The user has just called you. You must speak first immediately. Greeting the user politely as per your persona.`;

      this.session = await this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: options?.voiceName || 'Kore' } },
          },
          systemInstruction: {
             parts: [{ text: finalInstruction }]
          }
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
          },
          onmessage: (message: LiveServerMessage) => {
             this.handleServerMessage(message);
          },
          onclose: (e) => {
            console.log('Gemini Live Connection Closed', e);
            this.isConnected = false;
            this.config.onClose();
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            this.config.onError(e);
          },
        }
      });

      this.isConnected = true;
      await this.startMicrophone();
      
      // Note: We removed the explicit session.send() call because it is not reliably supported 
      // for text injection in this SDK version. We rely on the system instruction to trigger the first turn.

    } catch (error) {
       console.error("Connection failed", error);
       this.config.onError(error);
    }
  }

  private async startMicrophone() {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!this.inputAudioContext) return;

      this.inputSource = this.inputAudioContext.createMediaStreamSource(this.audioStream);
      
      // Use ScriptProcessor for raw PCM access
      this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        if (!this.isConnected || !this.session) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.float32ToInt16(inputData);
        
        // Encode to base64
        const base64Audio = this.arrayBufferToBase64(pcmData.buffer);
        
        this.session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Audio
          }
        });
      };

      this.inputSource.connect(this.processor);
      this.processor.connect(this.inputAudioContext.destination);

    } catch (err) {
      console.error("Microphone error", err);
      this.config.onError(err);
    }
  }

  private handleServerMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;
    
    if (serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
      const base64Audio = serverContent.modelTurn.parts[0].inlineData.data;
      this.playAudio(base64Audio);
      this.config.onAudioData(base64Audio);
    }
    
    if (serverContent?.interrupted) {
       this.stopAllAudio();
    }
  }

  private async playAudio(base64String: string) {
     if (!this.outputAudioContext) return;

     const audioData = this.base64ToArrayBuffer(base64String);
     const float32Data = new Float32Array(audioData.byteLength / 2);
     const dataView = new DataView(audioData);
     
     for (let i = 0; i < float32Data.length; i++) {
        float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
     }

     const buffer = this.outputAudioContext.createBuffer(1, float32Data.length, 24000);
     buffer.getChannelData(0).set(float32Data);

     const source = this.outputAudioContext.createBufferSource();
     source.buffer = buffer;
     source.connect(this.outputAudioContext.destination);

     if (this.nextStartTime < this.outputAudioContext.currentTime) {
         this.nextStartTime = this.outputAudioContext.currentTime;
     }
     
     source.start(this.nextStartTime);
     this.nextStartTime += buffer.duration;
  }

  private stopAllAudio() {
     this.nextStartTime = this.outputAudioContext?.currentTime || 0;
  }

  disconnect() {
    this.isConnected = false;
    
    if (this.session) {
        try { (this.session as any).close?.(); } catch(e) {}
    }
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }

    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
  }

  private float32ToInt16(float32: Float32Array) {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      let s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
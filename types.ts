export interface Contact {
  id: string;
  name: string;
  initial: string;
  color: string;
  type: 'contact' | 'group' | 'business';
  avatarUrl?: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  voiceName: string;
  details: string;
  avatarColor: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface RecentCall {
  id: string;
  name: string;
  number: string;
  date: string;
  type: 'incoming' | 'outgoing' | 'missed';
}

export enum CallState {
  IDLE = 'IDLE',
  RINGING = 'RINGING',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export enum Tab {
  KEYPAD = 'keypad',
  RECENTS = 'recents',
  CONTACTS = 'contacts',
}
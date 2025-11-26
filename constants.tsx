import React from 'react';

// Audio
export const RINGING_AUDIO_URL = "https://botsrhere.online/deontic/callerpro/ring.mp3";

// Icons
export const Icons = {
  Back: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  ),
  Menu: ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Voicemail: () => (
    <svg viewBox="0 0 24 14" className="w-4 h-3 fill-gray-500">
      <path d="M4.5 13C2.01 13 0 10.99 0 8.5S2.01 4 4.5 4c1.74 0 3.26.99 4.06 2.45A4.49 4.49 0 0 1 12.5 4C14.99 4 17 6.01 17 8.5S14.99 13 12.5 13c-1.74 0-3.26-.99-4.06-2.45A4.49 4.49 0 0 1 4.5 13zM4.5 6C3.12 6 2 7.12 2 8.5S3.12 11 4.5 11 7 9.88 7 8.5 5.88 6 4.5 6zm8 0C11.12 6 10 7.12 10 8.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S13.88 6 12.5 6z" transform="scale(1.4)" transformOrigin="center"/>
    </svg>
  ),
  Call: ({ className = "w-8 h-8 fill-white" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.51 1.51c-2.9-1.49-5.26-3.85-6.75-6.75l1.5-1.51c.23-.23.33-.56.24-1.01-.36-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 2.81 3 3.42 3 4.19c0 9.27 7.55 16.82 16.82 16.82.77 0 1.38-.65 1.38-1.19v-3.44c0-.55-.45-1-1.19-1z"/>
    </svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-gray-500">
      <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
    </svg>
  ),
  RecentsNav: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
    </svg>
  ),
  ContactsNav: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  Mic: () => (
    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
  ),
  KeypadGrid: () => (
    <div className="w-[20px] h-[20px] grid grid-cols-3 gap-[2px]">
        <div className="w-full pb-[100%] bg-current rounded-full"></div><div className="w-full pb-[100%] bg-current rounded-full"></div><div className="w-full pb-[100%] bg-current rounded-full"></div>
        <div className="w-full pb-[100%] bg-current rounded-full"></div><div className="w-full pb-[100%] bg-current rounded-full"></div><div className="w-full pb-[100%] bg-current rounded-full"></div>
        <div className="w-full pb-[100%] bg-current rounded-full"></div><div className="w-full pb-[100%] bg-current rounded-full"></div><div className="w-full pb-[100%] bg-current rounded-full"></div>
    </div>
  ),
  EndCall: () => (
     <svg viewBox="0 0 24 24" className="w-[34px] h-[34px] fill-white"><path d="M12 9c-1.6 0-3.15.25-4.6.72-.81.26-1.69.1-2.26-.54l-1.6-1.8c-.35-.39-.37-.97-.07-1.39C5.35 4.3 8.53 3 12 3s6.65 1.3 8.53 2.99c.3.42.28 1-.07 1.39l-1.6 1.8c-.57.64-1.45.8-2.26.54-.14-.05-1.45-.72-4.6-.72z"/></svg>
  ),
  Mute: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>
  ),
  Speaker: () => (
     <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Camera: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  ),
  Pencil: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  )
};
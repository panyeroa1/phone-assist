
import React, { useState, useEffect, useRef } from 'react';
import Keypad from './components/Keypad';
import CallScreen from './components/CallScreen';
import { Tab, CallState, Persona } from './types';
import { Icons } from './constants';
import { PERSONAS } from './data/personas';
import { supabase, uploadAvatar } from './services/supabaseClient';

// --- Components ---

const Recents = () => (
  <div className="flex-1 bg-white flex flex-col h-full overflow-hidden animate-fade-in">
    <div className="px-5 py-3 flex justify-between items-end bg-white/95 backdrop-blur min-h-[60px] border-b border-gray-200 shrink-0 sticky top-0 z-10">
      <h1 className="text-3xl font-bold tracking-tight">Recents</h1>
      <button className="text-blue-500 font-medium text-base mb-1 active:opacity-50">Edit</button>
    </div>
    
    <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            Today
        </div>
        
        {/* Mock Data */}
        {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center justify-between pl-4 pr-4 py-3 border-b border-gray-100 bg-white active:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <Icons.Call className="w-5 h-5 fill-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-black font-semibold text-[17px] leading-snug">Unknown</span>
                        <span className="text-gray-500 text-[15px] leading-snug">Mobile</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[15px]">12:45 PM</span>
                    <button className="p-2 text-blue-500">
                        <Icons.Info />
                    </button>
                </div>
            </div>
        ))}
    </div>
  </div>
);

const Contacts = ({ onSelect, personas, pickerMode }: { onSelect: (persona: Persona) => void, personas: Persona[], pickerMode?: boolean }) => {
  const sortedPersonas = [...personas].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden animate-fade-in">
       {/* Header */}
       <div className="px-4 py-3 flex justify-between items-end bg-white/95 backdrop-blur border-b border-gray-200 shrink-0 sticky top-0 z-20 min-h-[55px]">
        {pickerMode ? (
            <span className="text-[17px] font-semibold text-black mb-1 mx-auto">Select Contact</span>
        ) : (
            <>
                <button className="text-blue-500 text-[17px] mb-1 active:opacity-50">Groups</button>
                <h1 className="text-[17px] font-semibold text-black mb-1">Contacts</h1>
                <button className="text-blue-500 mb-1 active:opacity-50"><Icons.Plus /></button>
            </>
        )}
      </div>
      
      {/* Search Bar */}
      <div className="px-4 py-2 bg-white shrink-0 border-b border-gray-100">
        <div className="bg-gray-100/80 rounded-[10px] px-3 h-[36px] flex items-center gap-2 text-gray-500">
            <Icons.Search />
            <span className="text-[17px]">Search</span>
        </div>
      </div>
      
      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
          {/* My Card (Hide in picker mode) */}
          {!pickerMode && (
              <div className="bg-white pl-4 pr-4 py-3 flex items-center gap-4 border-b border-gray-100">
                 <div className="w-[50px] h-[50px] rounded-full bg-gray-300 flex justify-center items-center text-white text-xl font-medium shrink-0">
                    Me
                 </div>
                 <div className="flex flex-col">
                     <span className="font-bold text-[19px] text-black">My Card</span>
                     <span className="text-gray-400 text-[15px]">+1 202 555 0123</span>
                 </div>
              </div>
          )}

          {/* List */}
          <div className="bg-white pl-4">
             {sortedPersonas.map((persona) => (
                <div 
                  key={persona.id} 
                  className="flex items-center gap-3 py-3 pr-4 border-b border-gray-100 cursor-pointer active:bg-gray-50 transition-colors group"
                  onClick={() => onSelect(persona)}
                >
                   {persona.avatarUrl ? (
                      <img src={persona.avatarUrl} alt={persona.name} className="w-[40px] h-[40px] shrink-0 rounded-full object-cover shadow-sm" />
                   ) : (
                      <div className={`w-[40px] h-[40px] shrink-0 rounded-full ${persona.avatarColor} flex justify-center items-center text-white font-semibold text-lg shadow-sm`}>
                        {persona.name.charAt(0)}
                      </div>
                   )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-black text-[17px] truncate leading-tight group-active:text-black">{persona.name}</div>
                    <div className="text-[14px] text-gray-500 truncate leading-tight mt-0.5">{persona.role}</div>
                  </div>
                </div>
             ))}
             {/* Padding for bottom nav */}
             <div className="h-24"></div>
          </div>
      </div>
    </div>
  );
};

// --- Contact Details View ---

const ContactDetails = ({ 
    persona, 
    onBack, 
    onSave,
    onCall 
}: { 
    persona: Persona, 
    onBack: () => void, 
    onSave: (updated: Persona) => void,
    onCall: (persona: Persona) => void
}) => {
    const [name, setName] = useState(persona.name);
    const [role, setRole] = useState(persona.role);
    const [phone, setPhone] = useState(persona.phoneNumber || "");
    const [details, setDetails] = useState(persona.details);
    const [avatarUrl, setAvatarUrl] = useState(persona.avatarUrl);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = { ...persona, name, role, phoneNumber: phone, details, avatarUrl };
            await onSave(updated);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = await uploadAvatar(file);
            if (url) {
                setAvatarUrl(url);
            }
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#f2f2f7] flex flex-col h-full animate-slide-in font-sans">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur px-4 py-3 flex justify-between items-center border-b border-gray-300 sticky top-0 z-10">
                <button onClick={onBack} className="text-blue-500 flex items-center gap-1 text-[17px] active:opacity-50 transition-opacity">
                   <Icons.Back /> <span className="leading-none">Back</span>
                </button>
                <h2 className="font-semibold text-[17px] text-black">{persona.id ? 'Edit Contact' : 'New Contact'}</h2>
                <button onClick={handleSave} disabled={isSaving} className="text-blue-500 font-semibold text-[17px] active:opacity-50 transition-opacity disabled:opacity-50">
                    {isSaving ? 'Saving' : 'Done'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                {/* Avatar Hero */}
                <div className="flex flex-col items-center py-8">
                    <div className="relative group cursor-pointer active:opacity-80 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className="w-28 h-28 rounded-full object-cover shadow-sm border border-gray-200" />
                        ) : (
                            <div className={`w-28 h-28 rounded-full ${persona.avatarColor || 'bg-gray-400'} flex items-center justify-center text-white text-5xl font-medium shadow-sm border border-gray-200`}>
                                {(name || '?').charAt(0)}
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <button className="mt-3 text-blue-500 text-[15px] font-medium" onClick={() => fileInputRef.current?.click()}>
                        {persona.id ? 'Edit Photo' : 'Add Photo'}
                    </button>
                </div>

                {/* Form Fields */}
                <div className="px-4 space-y-6">
                    {/* Information Section */}
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-300">
                        <div className="pl-4 bg-white">
                             {/* Name */}
                            <div className="py-3 pr-4 border-b border-gray-200 flex flex-col">
                                <label className="text-[13px] text-blue-500 mb-0.5">Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full text-[17px] outline-none text-black bg-transparent placeholder-gray-400"
                                    placeholder="First Last"
                                />
                            </div>
                            {/* Role */}
                            <div className="py-3 pr-4 border-b border-gray-200 flex flex-col">
                                <label className="text-[13px] text-blue-500 mb-0.5">Role / Industry</label>
                                <input 
                                    type="text" 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full text-[17px] outline-none text-black bg-transparent placeholder-gray-400"
                                    placeholder="e.g. Real Estate Agent"
                                />
                            </div>
                            {/* Phone - No border for last item */}
                            <div className="py-3 pr-4 flex flex-col">
                                <label className="text-[13px] text-blue-500 mb-0.5">Mobile</label>
                                <input 
                                    type="tel" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full text-[17px] outline-none text-black bg-transparent placeholder-gray-400"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Prompt Section */}
                    <div>
                         <div className="text-[13px] text-gray-500 uppercase ml-4 mb-2 tracking-wide">System Prompt & Persona</div>
                         <div className="bg-white rounded-xl overflow-hidden border border-gray-300 p-4 min-h-[150px]">
                            <textarea 
                                value={details} 
                                onChange={(e) => setDetails(e.target.value)}
                                className="w-full text-[15px] outline-none leading-relaxed min-h-[200px] resize-none font-mono text-black bg-transparent placeholder-gray-400"
                                placeholder="Define the AI persona instructions here..."
                            />
                        </div>
                         <div className="text-[13px] text-gray-400 ml-4 mt-2">
                            These instructions define the voice agent's behavior.
                         </div>
                    </div>
                
                     {/* Call Button (Only if saved) */}
                     {persona.id && (
                         <div className="mt-4">
                             <button 
                                onClick={() => onCall({...persona, name, role, details, phoneNumber: phone, avatarUrl})}
                                className="w-full bg-white text-blue-500 text-[17px] py-3 rounded-xl border border-gray-300 active:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                             >
                                 Call {name || 'Contact'}
                             </button>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

// --- Action Sheet Component ---
const ActionSheet = ({ onClose, onNewContact, onExistingContact }: { onClose: () => void, onNewContact: () => void, onExistingContact: () => void }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 animate-fade-in" onClick={onClose}>
            <div className="bg-transparent px-3 pb-6 flex flex-col gap-2 w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white/90 backdrop-blur-md rounded-[14px] overflow-hidden">
                    <button onClick={onNewContact} className="w-full py-4 text-[20px] text-blue-500 font-normal border-b border-gray-300 active:bg-gray-200 transition-colors">
                        Create New Contact
                    </button>
                    <button onClick={onExistingContact} className="w-full py-4 text-[20px] text-blue-500 font-normal active:bg-gray-200 transition-colors">
                        Add to Existing Contact
                    </button>
                </div>
                <button onClick={onClose} className="bg-white py-4 rounded-[14px] text-[20px] font-semibold text-blue-500 active:bg-gray-200 transition-colors shadow-sm">
                    Cancel
                </button>
            </div>
        </div>
    );
};

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.KEYPAD);
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [dialedNumber, setDialedNumber] = useState("");
  const [activePersona, setActivePersona] = useState<Persona | undefined>(undefined);
  const [currentDisplayNumber, setCurrentDisplayNumber] = useState(""); 
  
  // Data State
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedContact, setSelectedContact] = useState<Persona | null>(null);

  // Add Number UX State
  const [showAddActionSheet, setShowAddActionSheet] = useState(false);
  const [contactPickerMode, setContactPickerMode] = useState(false);

  // Load Data
  useEffect(() => {
     fetchData();
  }, []);

  const fetchData = async () => {
      try {
          const { data, error } = await supabase.from('personas').select('*');
          
          if (error) {
              console.warn("Supabase fetch error (using offline mode):", error.message);
              // Use mock data if DB fails or doesn't exist yet
              setPersonas(PERSONAS);
              return;
          }
          
          if (data && data.length > 0) {
              const mapped: Persona[] = data.map((d: any) => ({
                  id: d.id,
                  name: d.name,
                  role: d.role,
                  voiceName: d.voice_name || d.voiceName,
                  details: d.details,
                  avatarColor: d.avatar_color || d.avatarColor,
                  phoneNumber: d.phone_number || d.phoneNumber,
                  avatarUrl: d.avatar_url || d.avatarUrl
              }));
              setPersonas(mapped);
          } else {
              // Only seed if table exists and is empty
              await seedData();
          }
      } catch (err) {
          console.error("Fetch exception, using default mock", err);
          setPersonas(PERSONAS);
      }
  };

  const seedData = async () => {
      console.log("Seeding initial data...");
      try {
        const dbRows = PERSONAS.map(p => ({
            name: p.name,
            role: p.role,
            voice_name: p.voiceName,
            details: p.details,
            avatar_color: p.avatarColor,
            phone_number: "+1 555 0199",
            avatar_url: p.avatarUrl || null
        }));

        const { data, error } = await supabase.from('personas').insert(dbRows).select();
        
        if (error) {
           console.error("Seeding failed:", error.message || JSON.stringify(error));
           // Fallback to memory
           setPersonas(PERSONAS);
        } else if (data) {
             const mapped: Persona[] = data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    role: d.role,
                    voiceName: d.voice_name,
                    details: d.details,
                    avatarColor: d.avatar_color,
                    phoneNumber: d.phone_number,
                    avatarUrl: d.avatar_url
              }));
              setPersonas(mapped);
        }
      } catch (e) {
          console.error("Seeding exception:", e);
          setPersonas(PERSONAS);
      }
  };

  const updatePersona = async (updated: Persona) => {
      // Logic split: INSERT vs UPDATE
      const isNew = !updated.id || updated.id.startsWith('new-');
      
      if (isNew) {
          // INSERT logic
          const tempId = updated.id || `temp-${Date.now()}`;
          const newPersona = { ...updated, id: tempId };
          setPersonas(prev => [...prev, newPersona]); // Optimistic
          setSelectedContact(newPersona);

          try {
             const dbRow = {
                name: updated.name || "New Contact",
                role: updated.role || "",
                voice_name: updated.voiceName || "Kore",
                details: updated.details || "",
                avatar_color: updated.avatarColor || "bg-gray-400",
                phone_number: updated.phoneNumber,
                avatar_url: updated.avatarUrl
             };
             const { data, error } = await supabase.from('personas').insert([dbRow]).select();
             if (error) throw error;
             if (data && data[0]) {
                 // Replace optimistic with real ID
                 const realId = data[0].id;
                 setPersonas(prev => prev.map(p => p.id === tempId ? { ...p, id: realId } : p));
                 setSelectedContact(prev => prev?.id === tempId ? { ...prev, id: realId } : prev);
             }
          } catch(e) {
              console.error("Insert failed:", e);
          }

      } else {
          // UPDATE logic
          setPersonas(prev => prev.map(p => p.id === updated.id ? updated : p));
          setSelectedContact(updated);

          // Skip DB for mock IDs
          if (updated.id.length < 10) return;

          try {
            const dbRow = {
                name: updated.name,
                role: updated.role,
                voice_name: updated.voiceName,
                details: updated.details,
                avatar_color: updated.avatarColor,
                phone_number: updated.phoneNumber,
                avatar_url: updated.avatarUrl
            };

            const { error } = await supabase.from('personas').update(dbRow).eq('id', updated.id);
            if (error) console.error("Update failed:", error.message);
          } catch (e) {
              console.error("Update exception:", e);
          }
      }
  };

  const startCall = (numberOrPersona: string | Persona) => {
    if (typeof numberOrPersona === 'string') {
        // Dialed manually
        setDialedNumber(numberOrPersona || "Unknown");
        setActivePersona(undefined);
    } else {
        // Called from contact
        setDialedNumber(numberOrPersona.name);
        setActivePersona(numberOrPersona);
    }
    setCallState(CallState.RINGING);
  };

  const endCall = () => {
    setCallState(CallState.IDLE);
    setDialedNumber("");
    setActivePersona(undefined);
  };

  // --- Add Number Handlers ---

  const handleCreateNewContact = () => {
      setShowAddActionSheet(false);
      // Open Details with a blank persona template, pre-filling number
      const newContact: Persona = {
          id: `new-${Date.now()}`,
          name: "",
          role: "",
          voiceName: "Kore",
          details: "",
          avatarColor: "bg-gray-400",
          phoneNumber: currentDisplayNumber
      };
      setSelectedContact(newContact);
  };

  const handleAddToExistingContact = () => {
      setShowAddActionSheet(false);
      setContactPickerMode(true);
      setActiveTab(Tab.CONTACTS);
  };

  const handleContactPick = (persona: Persona) => {
      if (contactPickerMode) {
          // Merge logic
          const updated = { ...persona, phoneNumber: currentDisplayNumber };
          updatePersona(updated);
          setContactPickerMode(false);
          setActiveTab(Tab.KEYPAD);
          // Optional: Show a brief "Updated" toast
      } else {
          setSelectedContact(persona);
      }
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-white overflow-hidden font-sans">
      
      {/* Call Overlay */}
      {callState !== CallState.IDLE && (
          <CallScreen 
            name={dialedNumber} 
            number={activePersona ? (activePersona.phoneNumber || activePersona.role) : "Mobile"} 
            callState={callState} 
            onEndCall={endCall} 
            setCallState={setCallState}
            activePersona={activePersona}
          />
      )}

      {/* Action Sheet Overlay */}
      {showAddActionSheet && (
          <ActionSheet 
             onClose={() => setShowAddActionSheet(false)}
             onNewContact={handleCreateNewContact}
             onExistingContact={handleAddToExistingContact}
          />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className={`absolute inset-0 bg-white ${activeTab === Tab.RECENTS ? 'z-10' : 'z-0'}`}>
            {activeTab === Tab.RECENTS && <Recents />}
        </div>
        
        <div className={`absolute inset-0 bg-white ${activeTab === Tab.KEYPAD ? 'z-10' : 'z-0'}`}>
             {activeTab === Tab.KEYPAD && (
                 <Keypad 
                    onCallStart={startCall} 
                    onNumberChange={setCurrentDisplayNumber} 
                    onAddNumber={() => setShowAddActionSheet(true)}
                    initialNumber={currentDisplayNumber}
                />
             )}
        </div>

        <div className={`absolute inset-0 bg-white ${activeTab === Tab.CONTACTS ? 'z-10' : 'z-0'}`}>
             {activeTab === Tab.CONTACTS && (
                 <Contacts 
                    onSelect={handleContactPick} 
                    personas={personas} 
                    pickerMode={contactPickerMode}
                 />
             )}
        </div>
        
        {/* Contact Details Slide-over */}
        {selectedContact && (
            <ContactDetails 
                persona={selectedContact}
                onBack={() => setSelectedContact(null)}
                onSave={updatePersona}
                onCall={(p) => {
                    startCall(p);
                    setSelectedContact(null);
                }}
            />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-around items-center bg-white/95 backdrop-blur border-t border-gray-200 pb-8 pt-2 z-40 shrink-0 h-[85px] select-none">
          <button 
            onClick={() => { setActiveTab(Tab.RECENTS); setContactPickerMode(false); }}
            className={`flex flex-col items-center gap-1 w-1/3 transition-colors ${activeTab === Tab.RECENTS ? 'text-blue-500' : 'text-gray-400'}`}
          >
             <div className="w-7 h-7 flex items-center justify-center">
                <Icons.RecentsNav />
             </div>
             <span className="text-[10px] font-medium">Recents</span>
          </button>

          <button 
            onClick={() => { setActiveTab(Tab.KEYPAD); setContactPickerMode(false); }}
            className={`flex flex-col items-center gap-1 w-1/3 transition-colors ${activeTab === Tab.KEYPAD ? 'text-blue-500' : 'text-gray-400'}`}
          >
             <div className="w-7 h-7 flex items-center justify-center">
                <Icons.KeypadGrid />
             </div>
             <span className="text-[10px] font-medium">Keypad</span>
          </button>

          <button 
            onClick={() => { setActiveTab(Tab.CONTACTS); setContactPickerMode(false); }}
            className={`flex flex-col items-center gap-1 w-1/3 transition-colors ${activeTab === Tab.CONTACTS ? 'text-blue-500' : 'text-gray-400'}`}
          >
             <div className="w-7 h-7 flex items-center justify-center">
                <Icons.ContactsNav />
             </div>
             <span className="text-[10px] font-medium">Contacts</span>
          </button>
      </div>
    </div>
  );
};

export default App;

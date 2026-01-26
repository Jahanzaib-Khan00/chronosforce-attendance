
import React, { useState, useMemo, useEffect } from 'react';
import { Message, Employee, UserRole } from '../types';
import { Send, X, MessageSquare, Megaphone, Search, UserPlus, Clock } from 'lucide-react';

interface CommunicationCenterProps {
  messages: Message[];
  currentUser: Employee;
  allEmployees: Employee[];
  lastReadTimestamps: Record<string, string>;
  onSendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  onReadChat: (chatId: string) => void;
  onClose: () => void;
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ 
  messages, 
  currentUser, 
  allEmployees, 
  lastReadTimestamps,
  onSendMessage, 
  onReadChat,
  onClose 
}) => {
  const [activeChat, setActiveChat] = useState<'GLOBAL' | string>('GLOBAL');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const canBroadcast = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT].includes(currentUser.role);

  // Trigger read receipt when chat is viewed
  useEffect(() => {
    onReadChat(activeChat);
  }, [activeChat, messages]);

  const recentContactIds = useMemo(() => {
    const ids = new Set<string>();
    messages.forEach(m => {
      if (m.receiverId && m.receiverId !== currentUser.id) ids.add(m.receiverId);
      if (m.senderId !== currentUser.id) ids.add(m.senderId);
    });
    return Array.from(ids);
  }, [messages, currentUser.id]);

  const recentContacts = useMemo(() => {
    return allEmployees.filter(e => recentContactIds.includes(e.id));
  }, [allEmployees, recentContactIds]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allEmployees.filter(e => 
      e.id !== currentUser.id && 
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allEmployees, searchQuery, currentUser.id]);

  const filteredMessages = messages.filter(m => {
    if (activeChat === 'GLOBAL') return !m.receiverId;
    return (m.senderId === currentUser.id && m.receiverId === activeChat) || 
           (m.senderId === activeChat && m.receiverId === currentUser.id);
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onSendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: activeChat === 'GLOBAL' ? undefined : activeChat,
      content: content.trim()
    });
    setContent('');
  };

  const currentChatUser = allEmployees.find(e => e.id === activeChat);

  const getUnreadCount = (senderId: string) => {
    const lastRead = lastReadTimestamps[senderId] || '1970-01-01T00:00:00Z';
    return messages.filter(m => m.senderId === senderId && m.receiverId === currentUser.id && m.timestamp > lastRead).length;
  };

  const globalUnreadCount = useMemo(() => {
    const lastRead = lastReadTimestamps['GLOBAL'] || '1970-01-01T00:00:00Z';
    return messages.filter(m => !m.receiverId && m.senderId !== currentUser.id && m.timestamp > lastRead).length;
  }, [messages, lastReadTimestamps, currentUser.id]);

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[60] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <MessageSquare size={24} />
          <h2 className="text-xl font-bold tracking-tight">Chronos Messaging</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X /></button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find colleague..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-2 space-y-1">
              <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Channels</p>
              <button 
                onClick={() => setActiveChat('GLOBAL')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${activeChat === 'GLOBAL' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white text-slate-600'}`}
              >
                <div className="flex items-center space-x-3">
                   <Megaphone size={18} />
                   <span className="font-bold text-sm">Global Board</span>
                </div>
                {globalUnreadCount > 0 && activeChat !== 'GLOBAL' && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                    {globalUnreadCount}
                  </span>
                )}
              </button>
            </div>

            {searchQuery.trim() === '' && (
              <div className="p-2 space-y-1 mt-4">
                <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <Clock size={10} className="mr-1" /> Direct Messages
                </p>
                {recentContacts.length === 0 ? (
                  <div className="px-4 py-10 text-center space-y-3">
                    <p className="text-xs text-slate-400 font-medium">No recent chats.</p>
                  </div>
                ) : (
                  recentContacts.map(emp => {
                    const unread = getUnreadCount(emp.id);
                    return (
                      <button 
                        key={emp.id}
                        onClick={() => setActiveChat(emp.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${activeChat === emp.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white text-slate-600'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${activeChat === emp.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {emp.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm leading-tight">{emp.name}</p>
                            <p className={`text-[10px] font-medium uppercase ${activeChat === emp.id ? 'text-indigo-200' : 'text-slate-400'}`}>{emp.role.replace('_', ' ')}</p>
                          </div>
                        </div>
                        {unread > 0 && activeChat !== emp.id && (
                          <span className="w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
            
            {searchQuery.trim() !== '' && (
               <div className="p-2 space-y-1 mt-4">
                  <p className="px-3 py-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Colleagues</p>
                  {searchResults.map(emp => (
                    <button key={emp.id} onClick={() => { setActiveChat(emp.id); setSearchQuery(''); }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-white text-slate-600 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">{emp.name.charAt(0)}</div>
                      <span className="font-bold text-sm">{emp.name}</span>
                    </button>
                  ))}
               </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${activeChat === 'GLOBAL' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                {activeChat === 'GLOBAL' ? <Megaphone size={20} /> : currentChatUser?.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {activeChat === 'GLOBAL' ? 'Global Board' : currentChatUser?.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                  {activeChat === 'GLOBAL' ? 'Company Announcements' : `${currentChatUser?.role.replace('_', ' ')}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
            {filteredMessages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm shadow-sm ${
                  msg.senderId === currentUser.id 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {activeChat === 'GLOBAL' && msg.senderId !== currentUser.id && (
                    <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-tighter border-b border-indigo-50/10 pb-1">{msg.senderName}</p>
                  )}
                  <p className="leading-relaxed font-medium">{msg.content}</p>
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase flex items-center px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {(activeChat !== 'GLOBAL' || canBroadcast) && (
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex space-x-3 items-center">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <button className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                  <Send size={20} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;

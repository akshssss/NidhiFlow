'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatINR, formatDate } from '@/lib/format';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare, Send, CheckCheck, User, Building2,
  Clock, ArrowLeft, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function ChatPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat rooms
  const fetchRooms = async () => {
    try {
      const data = await api.getChatRooms();
      setRooms(data);
      if (data && data.length > 0 && !activeRoomId) {
        setActiveRoomId(data[0].id);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }
    if (user) {
      fetchRooms();
    }
  }, [user, isLoading]);

  // Connect Socket.IO
  useEffect(() => {
    if (!token) return;

    const s = io('/chat', {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('Socket connected');
    });

    s.on('new_message', (data: { roomId: string; message: any }) => {
      if (data.roomId === activeRoomId) {
        setMessages((prev) => [...prev, data.message]);
      }
      fetchRooms();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token, activeRoomId]);

  // Join room when activeRoomId changes
  useEffect(() => {
    if (!activeRoomId) return;

    if (socket) {
      socket.emit('join_room', { roomId: activeRoomId });
    }

    // Load message history
    api.getChatMessages(activeRoomId)
      .then((res) => {
        if (res && res.data) setMessages(res.data);
      })
      .catch(() => {});
  }, [activeRoomId, socket]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeRoomId) return;

    const text = content.trim();
    setContent('');
    setSending(true);

    try {
      if (socket && socket.connected) {
        socket.emit('send_message', {
          roomId: activeRoomId,
          dto: { content: text },
        });
      } else {
        const msg = await api.sendMessage(activeRoomId, { content: text });
        setMessages((prev) => [...prev, msg]);
        fetchRooms();
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // Identify other party
  const getOtherParty = (room: any) => {
    if (!room?.interest) return { name: 'Deal Room', subtitle: '' };
    if (user?.role === 'STARTUP') {
      return {
        name: room.interest.investor?.displayName,
        firm: room.interest.investor?.firmName,
        subtitle: `Investor (${room.interest.investor?.type})`,
        link: `/investors/${room.interest.investor?.id}`,
      };
    } else {
      return {
        name: room.interest.startup?.companyName,
        firm: room.interest.startup?.sector,
        subtitle: `Startup (${room.interest.startup?.stage})`,
        link: `/startups/${room.interest.startup?.id}`,
      };
    }
  };

  if (isLoading || (loadingRooms && rooms.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading your deal rooms...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 flex-1 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex overflow-hidden min-h-[600px] h-[calc(100vh-140px)]">
          {/* ── Left Pane: Rooms List ── */}
          <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/40">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                Deal Rooms ({rooms.length})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {rooms.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active deal rooms yet. Connect with a startup or investor to start chatting.
                </div>
              ) : (
                rooms.map((room) => {
                  const other = getOtherParty(room);
                  const isSelected = room.id === activeRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-50/80 dark:bg-brand-950/50 border-l-4 border-brand-600'
                          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-800 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                        {other.name?.charAt(0) || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {other.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatDate(room.updatedAt)}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-brand-600 truncate mt-0.5">
                          {formatINR(room.interest?.ticketAmount)} Cheque
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {room.lastMessage?.content || 'No messages yet'}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right Pane: Active Chat Room ── */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
            {activeRoom ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-800 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {getOtherParty(activeRoom).name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {getOtherParty(activeRoom).name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700">
                          {activeRoom.interest?.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {getOtherParty(activeRoom).subtitle} • Proposed: {formatINR(activeRoom.interest?.ticketAmount)}
                      </span>
                    </div>
                  </div>

                  {getOtherParty(activeRoom).link && (
                    <Link
                      href={getOtherParty(activeRoom).link || '#'}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      View Profile
                    </Link>
                  )}
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            {isMe ? 'You' : msg.sender?.name}
                          </span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-brand-800 text-white rounded-br-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <input
                    type="text"
                    required
                    placeholder="Type your message to founders / investors... (Press Enter to send)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="p-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white shadow-sm disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Select a Deal Room</h3>
                <p className="text-xs mt-1">Choose a conversation from the left to start collaborating.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

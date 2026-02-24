"use client";
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import StatsCards from '../../components/StatsCards';
import { notFound } from 'next/navigation';

// Mock getMessages function
function getMessages(userId: string) {
  return [
    {
      id: '1',
      from: 'Alice',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      messages: [
        { text: 'Hey, how are you?', time: '2m ago', fromMe: false },
        { text: 'I am good, thanks!', time: '1m ago', fromMe: true },
      ],
    },
    {
      id: '2',
      from: 'Bob',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      messages: [
        { text: 'Let’s catch up soon!', time: '10m ago', fromMe: false },
        { text: 'Sure, when?', time: '9m ago', fromMe: true },
      ],
    },
    {
      id: '3',
      from: 'Clara',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      messages: [
        { text: 'Sent you the docs.', time: '1h ago', fromMe: false },
        { text: 'Received, thanks!', time: '59m ago', fromMe: true },
      ],
    },
  ];
}

import React, { useState } from 'react';

export default function ChatPage({ params }: { params: { id: string } }) {
  const messages = getMessages('demo-user');
  const chat = messages.find(m => m.id === params.id);
  const [input, setInput] = useState('');
  // For demo, local state for new messages
  // Add delivered/read status for demo
  const [localMessages, setLocalMessages] = useState(
    chat
      ? chat.messages.map((m, i) => ({
          ...m,
          delivered: m.fromMe ? true : false,
          read: m.fromMe ? i === chat.messages.length - 1 : false,
        }))
      : []
  );
  if (!chat) return notFound();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLocalMessages([
      ...localMessages,
      {
        text: input,
        time: 'now',
        fromMe: true,
        delivered: true,
        read: false,
      },
    ]);
    setInput('');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Sidebar />
      <main className="flex-1 px-12 py-10 flex flex-col">
        <Header userName="John Doe" />
        <div className="mb-10 flex justify-center gap-8">
          <StatsCards stats={{ matches: 24, chats: 18, views: 156 }} />
        </div>
        <h2 className="text-3xl font-bold mb-4">Chat with {chat.from}</h2>
        <div className="flex items-center mb-6">
          <img src={chat.avatar} alt={`${chat.from} avatar`} className="w-14 h-14 rounded-full object-cover mr-4" />
          <span className="font-bold text-lg">{chat.from}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {localMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}> 
              <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-md ${msg.fromMe ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-white text-gray-700'} font-medium relative`}> 
                {msg.text}
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  {msg.time}
                  {msg.fromMe && (
                    <span className="ml-2 flex items-center">
                      {/* Single check for delivered, double for read */}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 8l3 3 5-5" stroke={msg.read ? '#a21caf' : '#aaa'} strokeWidth="2" fill="none" />
                      </svg>
                      {msg.delivered && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="-ml-3">
                          <path d="M6 10l3 3 5-5" stroke={msg.read ? '#a21caf' : '#aaa'} strokeWidth="2" fill="none" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-4 mt-auto bg-white rounded-xl shadow px-4 py-3">
          <input
            type="text"
            className="flex-1 border-none outline-none text-lg bg-transparent"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white font-semibold px-6 py-2 rounded-full text-lg shadow hover:scale-105 transition"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

const ChatBox = ({ roomId, myUsername }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    const onMessage = (msg) => {
      console.log('💬 Message received:', msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receive_message', onMessage);
    return () => socket.off('receive_message', onMessage);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('send_message', { roomId, message: input.trim() });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-xl overflow-hidden">
  
  <div className="px-4 py-3 border-b border-gray-700 shrink-0">
    <h3 className="m-0 text-blue-500 font-bold">
      💬 Chat
    </h3>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
    {messages.length === 0 && (
      <p className="text-gray-500 text-[13px] text-center mt-5">
        No messages yet. Say hi! 👋
      </p>
    )}

    {messages.map((msg, i) => {
      const isMe = msg.username === myUsername;
      return (
        <div
          key={i}
          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
        >
          {/* Username + time */}
          <div className={`text-[11px] text-gray-400 mb-0.75 ${isMe ? 'pr-1' : 'pl-1'}`}>
            {isMe ? 'You' : msg.username} · {formatTime(msg.timestamp)}
          </div>

          <div
            className={`max-w-[85%] px-3 py-2 text-sm wrap-break-word leading-relaxed text-white 
              ${isMe 
                ? 'rounded-[16px_16px_4px_16px] bg-blue-600' 
                : 'rounded-[16px_16px_16px_4px] bg-gray-700'
              }`}
          >
            {msg.message}
          </div>
        </div>
      );
    })}
    <div ref={bottomRef} />
  </div>

  {/* Input */}
  <div className="px-4 py-3 border-t border-gray-700 flex gap-2 shrink-0">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type a message..."
      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
    />
    <button
      onClick={sendMessage}
      disabled={!input.trim()}
      className={`border-none rounded-lg px-3.5 py-2 font-bold text-lg transition-colors 
        ${input.trim() 
          ? 'bg-blue-600 text-white cursor-pointer' 
          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
    >
      ➤
    </button>
  </div>
</div>
  );
};

export default ChatBox;
import React, { useState } from 'react';

const VideoControls = ({ onVideoChange }) => {
  const [url, setUrl] = useState('');

  const extractId = (input) => {
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = extractId(url.trim());
    if (id) {
      onVideoChange(id);
      setUrl('');
    } else if (url.trim() !== '') {
      alert("Please enter a valid YouTube link (e.g., watch?v=... or /shorts/...)");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-inner"
    >
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Paste YouTube Link or Shorts..."
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <button 
        type="submit" 
        disabled={!url.trim()}
        className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
          url.trim() 
            ? "bg-blue-600 hover:bg-blue-500 text-white" 
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        Change Video
      </button>
    </form>
  );
};

export default VideoControls;
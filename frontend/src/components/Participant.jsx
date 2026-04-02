import React from 'react';
import { socket } from '../socket';

const ParticipantList = ({ participants, roomId, myRole }) => {

  const handleKick = (targetUserId, username) => {
    if (!window.confirm(`Kick ${username} from the room?`)) return;
    console.log('👢 Kicking:', targetUserId);
    socket.emit('kick_user', { roomId, targetUserId });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 h-full overflow-y-auto box-border">
  <h2 className="text-blue-500 font-bold mb-4">
    👥 Participants ({participants.length})
  </h2>

  {participants.map((p) => (
    <div
      key={p.userId}
      className="flex items-center justify-between p-[10px_12px] mb-2 bg-gray-700 rounded-lg"
    >
      <div>
        <p className="font-semibold text-sm leading-tight">{p.username}</p>
        <p 
          className={`text-[11px] uppercase mt-0.5 ${
            p.role === 'Host' ? 'text-yellow-400' : 'text-gray-400'
          }`}
        >
          {p.role === 'Host' ? '👑 Host' : p.role}
        </p>
      </div>

      {myRole === 'Host' && p.role !== 'Host' && (
        <button
          onClick={() => handleKick(p.userId, p.username)}
          className="bg-red-500 hover:bg-red-600 text-white border-none rounded-md px-2.5 py-1 text-[12px] cursor-pointer font-bold transition-colors"
        >
          Kick
        </button>
      )}
    </div>
  ))}
</div>
  );
};

export default ParticipantList;
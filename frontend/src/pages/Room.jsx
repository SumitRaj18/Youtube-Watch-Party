import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../socket';
import VideoPlayer from '../components/VideoPlayer';
import VideoControls from '../components/VideoControls';
import ParticipantList from '../components/Participant';
import ChatBox from '../components/ChatBox';
import toast from 'react-hot-toast';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const [participants, setParticipants] = useState([]);
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=YleIZgpTF6w&list=RDYleIZgpTF6w&start_radio=1');
  const [playing, setPlaying] = useState(false);
  const [myRole, setMyRole] = useState('Participant');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // mobile tab switcher

  const myUserIdRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const pendingSyncRef = useRef(null);
  const isPlayerReadyRef = useRef(false);
  const isSyncingRef = useRef(false);

  const canControl = myRole === 'Host' || myRole === 'Moderator';

  const safeSeek = (time) => {
    const player = playerRef.current;
    if (!player) return;
    if (typeof player.seekTo === 'function') {
      player.seekTo(time, 'seconds');
      return;
    }
    player.getInternalPlayer?.()?.seekTo?.(time);
  };

  const getTime = () => {
    const player = playerRef.current;
    if (!player) return 0;
    if (typeof player.getCurrentTime === 'function') return player.getCurrentTime();
    return player.getInternalPlayer?.()?.getCurrentTime?.() || 0;
  };

  const updateMyInfo = useCallback((users) => {
    setParticipants([...users]);
    const me = users.find(
      (p) => String(p.userId) === String(myUserIdRef.current) || p.socketId === socket.id
    );
    if (me) setMyRole(me.role);
  }, []);

  const applyPendingSync = useCallback(() => {
    const sync = pendingSyncRef.current;
    if (!sync) return;
    isSyncingRef.current = true;
    safeSeek(sync.currentTime || 0);
    setPlaying(sync.playing);
    pendingSyncRef.current = null;
    setTimeout(() => { isSyncingRef.current = false; }, 500);
  }, []);

  useEffect(() => {
    const joinRoom = () => {
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    socket.emit('join_room', { roomId });
  };
       socket.on('room_error', ({ message }) => {
    toast.error(message);
    navigate('/');
  });
    socket.on('connect', () => { joinRoom(); });
    socket.on('connect_error', (err) => { console.error('❌ Socket connection error:', err.message); });
    socket.on('me', ({ userId }) => { myUserIdRef.current = userId; });
    socket.on('user_joined', ({ participants }) => { updateMyInfo(participants); });
    socket.on('user_left', ({ participants }) => { updateMyInfo(participants); });
    socket.on('kicked', () => { toast.error('You were removed from the room'); navigate('/'); });
    socket.on('room_ended', () => { toast.success('The host has ended the room'); navigate('/'); });
   
    socket.auth = { token: localStorage.getItem('token') };
    connectSocket();
    if (socket.connected) joinRoom();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('me');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('kicked');
      socket.off('room_ended');
    };
  }, [roomId, navigate, updateMyInfo]);

  useEffect(() => {
    const onSync = (state) => {
      if (state.videoId) setVideoUrl(`https://www.youtube.com/watch?v=${state.videoId}`);
      pendingSyncRef.current = state;
      isSyncingRef.current = true;
      setTimeout(() => { isSyncingRef.current = false; }, 2000);
      setPlaying(state.playing ? true : false);
      if (isPlayerReadyRef.current) applyPendingSync();
    };

    const onPlay = ({ currentTime }) => {
      isSyncingRef.current = true;
      setPlaying(true);
      if (isPlayerReadyRef.current) safeSeek(currentTime);
      setTimeout(() => { isSyncingRef.current = false; }, 500);
    };

    const onPause = ({ currentTime }) => {
      isSyncingRef.current = true;
      setPlaying(false);
      if (isPlayerReadyRef.current) safeSeek(currentTime);
      setTimeout(() => { isSyncingRef.current = false; }, 500);
    };

    const onVideoChanged = ({ videoId }) => {
      isPlayerReadyRef.current = false;
      setIsPlayerReady(false);
      setPlaying(false);
      setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
    };

    socket.on('sync_state', onSync);
    socket.on('play', onPlay);
    socket.on('pause', onPause);
    socket.on('video_changed', onVideoChanged);

    return () => {
      socket.off('sync_state', onSync);
      socket.off('play', onPlay);
      socket.off('pause', onPause);
      socket.off('video_changed', onVideoChanged);
    };
  }, [applyPendingSync]);

  const handlePlayerReady = () => {
    isPlayerReadyRef.current = true;
    setIsPlayerReady(true);
    setTimeout(() => { applyPendingSync(); }, 300);
  };

  const handleVideoChange = (videoId) => {
    if (canControl) socket.emit('change_video', { roomId, videoId });
  };

  const handlePlay = () => {
    if (isSyncingRef.current) return;
    if (canControl && isPlayerReadyRef.current) socket.emit('play', { roomId, currentTime: getTime() });
  };

  const handlePause = () => {
    if (isSyncingRef.current) return;
    if (canControl && isPlayerReadyRef.current) socket.emit('pause', { roomId, currentTime: getTime() });
  };

  const handleEndRoom = () => {
    if (!window.confirm('Are you sure you want to end the room for everyone?')) return;
    socket.emit('end_room', { roomId });
    navigate('/');
  };

  const handleLeaveRoom = () => {
    if (!window.confirm('Are you sure you want to leave the room?')) return;
    socket.emit('leave_room', { roomId });
    navigate('/');
  };

  const myUsername = participants.find(
    (p) => String(p.userId) === String(myUserIdRef.current)
  )?.username || '';



  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#111827] text-white p-3 sm:p-4 lg:p-6 gap-3 sm:gap-4 lg:gap-6 box-border min-h-screen lg:min-h-0">

      <div className="flex flex-col min-w-0 lg:flex-1 lg:overflow-hidden">

        {/* Header */}
        <header className="mb-3 shrink-0 flex justify-between items-center gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-500 m-0 truncate">
              Room: {roomId}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
              Role: <span className="text-blue-300 uppercase">{myRole}</span>
            </p>
          </div>

          {myRole === 'Host' ? (
            <button
              onClick={handleEndRoom}
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 font-bold cursor-pointer text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              🔚 End Room
            </button>
          ) : (
            <button
              onClick={handleLeaveRoom}
              className="shrink-0 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 font-bold cursor-pointer text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              🚶 Leave
            </button>
          )}
        </header>

        {/* Video controls */}
        {canControl && (
          <div className="shrink-0 mb-3">
            <VideoControls onVideoChange={handleVideoChange} />
          </div>
        )}

        {!canControl && (
          <p className="text-yellow-500 text-xs sm:text-sm mb-3 shrink-0">
            👀 You are a Participant — only the Host can control playback.
          </p>
        )}

        {/* Video player — 16:9 on mobile, fills height on desktop */}
        <div className="w-full aspect-video lg:aspect-auto lg:flex-1 rounded-xl overflow-hidden bg-black lg:min-h-0">
          <VideoPlayer
            url={videoUrl}
            playing={playing}
            ref={playerRef}
            canControl={canControl}
            onReady={handlePlayerReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onError={(e) => console.error('❌ Player Error:', e)}
          />
        </div>
      </div>

    
      <div className="flex flex-col lg:w-[320px] lg:shrink-0 lg:gap-4 lg:overflow-hidden">

        <div className="flex lg:hidden border border-gray-700 rounded-xl overflow-hidden shrink-0 mb-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${
              activeTab === 'participants'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            👥 People ({participants.length})
          </button>
        </div>

        <div className={`lg:block lg:shrink-0 lg:max-h-64 lg:overflow-hidden ${activeTab === 'participants' ? 'block' : 'hidden'} lg:block`}>
          <ParticipantList
            participants={participants}
            roomId={roomId}
            myRole={myRole}
          />
        </div>

        <div className={`lg:flex lg:flex-1 lg:min-h-0 ${activeTab === 'chat' ? 'flex' : 'hidden'} lg:flex flex-col h-[400px] lg:h-auto`}>
          <ChatBox
            roomId={roomId}
            myUsername={myUsername}
          />
        </div>

      </div>
    </div>
  );
};

export default Room;
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const VideoPlayer = forwardRef(
  ({ url, playing, onReady, onPlay, onPause, onError, canControl }, ref) => {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    const readyRef = useRef(false);
    const isBufferingRef = useRef(false);

    const getVideoId = (url) => {
      const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return match?.[1];
    };

    const videoId = getVideoId(url);

    useImperativeHandle(ref, () => ({
      seekTo: (time) => {
        if (playerRef.current && readyRef.current) {
          playerRef.current.seekTo(time);
        }
      },
      getCurrentTime: () => playerRef.current?.getCurrentTime?.() || 0,
      getInternalPlayer: () => playerRef.current,
    }));

    useEffect(() => {
      if (!videoId) return;

      const initPlayer = () => {
        if (!iframeRef.current) return;

        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
          readyRef.current = false;
        }

        playerRef.current = new window.YT.Player(iframeRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            enablejsapi: 1,
            playsinline: 1,
            controls: canControl ? 1 : 0, 
            origin: window.location.origin,
            disablekb: canControl ? 0 : 1, 
          },
          events: {
            onReady: () => {
              console.log('✅ YouTube Player Ready');
              readyRef.current = true;
              onReady?.();
            },
            onStateChange: (e) => {
              const YT = window.YT.PlayerState;

              if (e.data === YT.BUFFERING) {
                isBufferingRef.current = true;
              }

              if (e.data === YT.PLAYING) {
                isBufferingRef.current = false;
                onPlay?.();
              }

              if (e.data === YT.PAUSED) {
                if (isBufferingRef.current) {
                  isBufferingRef.current = false;
                  return;
                }
                onPause?.();
              }
            },
            onError: (e) => onError?.(e),
          },
        });
      };

      if (window.YT?.Player) {
        initPlayer();
      } else {
        if (!document.querySelector('script[src*="iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
        }
        window.onYouTubeIframeAPIReady = initPlayer;
      }

      return () => {
        playerRef.current?.destroy?.();
        playerRef.current = null;
        readyRef.current = false;
      };
    }, [videoId, canControl]);

    useEffect(() => {
      if (!playerRef.current || !readyRef.current) return;
      if (playing) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }, [playing]);

    return (
      <div className="w-full h-full bg-black relative">
  {!videoId ? (
    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
      🎬 No video loaded — paste a YouTube link above
    </div>
  ) : (
    <>
      <div ref={iframeRef} className="w-full h-full" />

      {!canControl && (
        <div className="absolute inset-0 z-10 cursor-not-allowed" />
      )}
    </>
  )}
</div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
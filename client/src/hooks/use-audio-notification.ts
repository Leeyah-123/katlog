import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorage } from './use-local-storage';

export function useAudioNotification() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage(
    'notifications-enabled',
    false
  );

  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  const playNotification = useCallback(() => {
    if (!notificationsEnabled) {
      if (hasInteracted) {
        setNotificationsEnabled(true);
        audioRef.current?.play();
      } else {
        setShowPermissionPrompt(true);
      }
    } else {
      audioRef.current?.play();
    }
  }, [hasInteracted, notificationsEnabled, setNotificationsEnabled]);

  const enableNotifications = useCallback(() => {
    setNotificationsEnabled(true);
    setShowPermissionPrompt(false);
    audioRef.current?.play();
  }, [setNotificationsEnabled]);

  return {
    audioRef,
    showPermissionPrompt,
    setShowPermissionPrompt,
    enableNotifications,
    playNotification,
  };
}

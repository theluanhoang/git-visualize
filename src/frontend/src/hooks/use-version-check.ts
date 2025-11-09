import { useState, useEffect } from 'react';
import { localStorageHelpers, LOCALSTORAGE_KEYS } from '@/constants/localStorage';

interface UseVersionCheckProps {
  practiceId: string;
  practiceTitle: string;
  currentVersion: number;
  onVersionMismatch?: () => void;
}

export function useVersionCheck({ 
  practiceId, 
  practiceTitle, 
  currentVersion, 
  onVersionMismatch 
}: UseVersionCheckProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [savedVersion, setSavedVersion] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!practiceId || !currentVersion) return;

    const saved = localStorageHelpers.version.getVersion(practiceId);
    setSavedVersion(saved);

    if (saved !== null && saved !== currentVersion) {
      setShowResetDialog(true);
    } else if (saved === null) {
      const hasLegacyData = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId)) !== null;
      
      
      if (hasLegacyData) {
        localStorageHelpers.version.saveVersion(practiceId, currentVersion);
      } else {
        localStorageHelpers.version.saveVersion(practiceId, currentVersion);
      }
    } else {
      console.log('Version match, no action needed');
    }
  }, [practiceId, currentVersion]);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    
    try {
      localStorageHelpers.version.clearVersionedData(practiceId, currentVersion);
      localStorageHelpers.version.saveVersion(practiceId, currentVersion);
      
      onVersionMismatch?.();
      
      setShowResetDialog(false);
    } catch (error) {
      console.error('Failed to reset versioned data:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancelReset = () => {
    setShowResetDialog(false);
  };

  return {
    showResetDialog,
    savedVersion,
    isResetting,
    handleConfirmReset,
    handleCancelReset,
  };
}

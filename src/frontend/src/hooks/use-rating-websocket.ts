import { useEffect, useRef, useState } from 'react';
import { websocketService } from '@/services/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { ratingKeys } from '@/lib/react-query/hooks/use-ratings';
import { lessonKeys } from '@/lib/react-query/query-keys';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { SocketEvents } from '@/constants/socket-events';

interface UseRatingWebSocketOptions {
  lessonId: string;
  enabled?: boolean;
}

export const useRatingWebSocket = ({ lessonId, enabled = true }: UseRatingWebSocketOptions) => {
  const queryClient = useQueryClient();
  const subscribedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const handlersRegisteredRef = useRef(false);
  const handlersRef = useRef<{
    handleRatingCreated: (data: { lessonId: string; rating: any }) => void;
    handleRatingUpdated: (data: { lessonId: string; rating: any }) => void;
    handleRatingDeleted: (data: { lessonId: string; userId: string }) => void;
    handleStatsUpdated: (data: { lessonId: string; stats: any }) => void;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !lessonId) return;

    tokenRef.current = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);

    const createHandlers = () => {
      const handleRatingCreated = (data: { lessonId: string; rating: any }) => {
        if (data.lessonId !== lessonId) return;

        queryClient.setQueryData<any[]>(ratingKeys.list(lessonId), (old = []) => {
          const existingIndex = old.findIndex((r) => r.id === data.rating.id);
          if (existingIndex !== -1) {
            const updated = [...old];
            updated[existingIndex] = data.rating;
            return updated;
          }
          return [data.rating, ...old];
        });
        
        queryClient.invalidateQueries({ queryKey: ratingKeys.userRating(lessonId) });
        queryClient.invalidateQueries({ queryKey: ratingKeys.stats(lessonId) });
        queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      };

      const handleRatingUpdated = (data: { lessonId: string; rating: any }) => {
        if (data.lessonId !== lessonId) return;

        queryClient.setQueryData<any[]>(ratingKeys.list(lessonId), (old = []) => {
          if (!old || old.length === 0) return [data.rating];
          const existingIndex = old.findIndex((r) => r.id === data.rating.id);
          if (existingIndex !== -1) {
            const updated = [...old];
            updated[existingIndex] = data.rating;
            return updated;
          }
          return [data.rating, ...old];
        });
        
        queryClient.setQueryData(ratingKeys.userRating(lessonId), (old: any) => {
          if (old && old.id === data.rating.id) {
            return data.rating;
          }
          return old;
        });
        
        queryClient.invalidateQueries({ queryKey: ratingKeys.stats(lessonId) });
        queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      };

      const handleRatingDeleted = (data: { lessonId: string; userId: string }) => {
        if (data.lessonId !== lessonId) return;

        queryClient.setQueryData<any[]>(ratingKeys.list(lessonId), (old = []) => {
          if (!old || old.length === 0) return [];
          return old.filter((r) => r.userId !== data.userId);
        });
        
        queryClient.invalidateQueries({ queryKey: ratingKeys.userRating(lessonId) });
        queryClient.invalidateQueries({ queryKey: ratingKeys.stats(lessonId) });
        queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      };

      const handleStatsUpdated = (data: { lessonId: string; stats: any }) => {
        if (data.lessonId !== lessonId) return;
        queryClient.setQueryData(ratingKeys.stats(lessonId), data.stats);
        queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      };

      return {
        handleRatingCreated,
        handleRatingUpdated,
        handleRatingDeleted,
        handleStatsUpdated,
      };
    };

    handlersRef.current = createHandlers();

    if (handlersRef.current && !handlersRegisteredRef.current) {
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.RATING_CREATED, handlersRef.current.handleRatingCreated);
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.RATING_UPDATED, handlersRef.current.handleRatingUpdated);
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.RATING_DELETED, handlersRef.current.handleRatingDeleted);
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.STATS_UPDATED, handlersRef.current.handleStatsUpdated);
      handlersRegisteredRef.current = true;
    } else if (handlersRef.current && handlersRegisteredRef.current) {
      websocketService.off(SocketEvents.SERVER_TO_CLIENT.RATING_CREATED);
      websocketService.off(SocketEvents.SERVER_TO_CLIENT.RATING_UPDATED);
      websocketService.off(SocketEvents.SERVER_TO_CLIENT.RATING_DELETED);
      websocketService.off(SocketEvents.SERVER_TO_CLIENT.STATS_UPDATED);
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.RATING_CREATED, handlersRef.current.handleRatingCreated);
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.RATING_UPDATED, handlersRef.current.handleRatingUpdated);
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.RATING_DELETED, handlersRef.current.handleRatingDeleted);
      websocketService.on(SocketEvents.SERVER_TO_CLIENT.STATS_UPDATED, handlersRef.current.handleStatsUpdated);
    }

    const subscribeToLesson = async (): Promise<void> => {
      try {
        if (!websocketService.isConnected()) {
          return;
        }

        const result = await websocketService.subscribeToLesson(lessonId);
        
        if (result.success) {
          subscribedRef.current = true;
          setIsConnected(true);
        }
      } catch (error) {
        subscribedRef.current = false;
        setIsConnected(false);
      }
    };

    const handleSubscription = async () => {
      if (!subscribedRef.current) {
        await subscribeToLesson();
      }
    };

    const setupConnection = async () => {
      try {
        const socket = await websocketService.connectWithAuth('/ratings');
        
        const updateConnectionState = () => {
          const connected = websocketService.isConnected();
          setIsConnected(connected);
          if (connected && !subscribedRef.current) {
            handleSubscription();
          }
        };

        updateConnectionState();

        const onConnect = () => {
          updateConnectionState();
          handleSubscription();
        };

        const onDisconnect = () => {
          setIsConnected(false);
          subscribedRef.current = false;
        };

        socket.on(SocketEvents.SERVER_TO_CLIENT.CONNECT, onConnect);
        socket.on(SocketEvents.SERVER_TO_CLIENT.DISCONNECT, onDisconnect);

        if (socket.connected && !subscribedRef.current) {
          await handleSubscription();
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    const tokenUnsubscribe = websocketService.onTokenUpdate(() => {
      const currentToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
      
      if (currentToken !== tokenRef.current) {
        tokenRef.current = currentToken;
        websocketService.updateToken();
        subscribedRef.current = false;
        setIsConnected(false);
        if (websocketService.isConnected()) {
          handleSubscription();
        }
      } else {
        tokenRef.current = currentToken;
      }
    });

    setupConnection();

    return () => {
      tokenUnsubscribe();
      
      if (subscribedRef.current) {
        websocketService.unsubscribeFromLesson(lessonId).catch(() => {});
        subscribedRef.current = false;
      }
      
      if (handlersRef.current) {
        websocketService.off(SocketEvents.SERVER_TO_CLIENT.RATING_CREATED, handlersRef.current.handleRatingCreated);
        websocketService.off(SocketEvents.SERVER_TO_CLIENT.RATING_UPDATED, handlersRef.current.handleRatingUpdated);
        websocketService.off(SocketEvents.SERVER_TO_CLIENT.RATING_DELETED, handlersRef.current.handleRatingDeleted);
        websocketService.off(SocketEvents.SERVER_TO_CLIENT.STATS_UPDATED, handlersRef.current.handleStatsUpdated);
      }
      handlersRegisteredRef.current = false;
    };
  }, [lessonId, enabled, queryClient]);

  return {
    isConnected: isConnected || websocketService.isConnected(),
  };
};

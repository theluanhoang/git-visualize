import { useEffect, useRef, useState, useCallback } from 'react';
import { websocketService } from '@/services/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { paymentKeys } from './use-payment';
import { subscriptionKeys } from './use-subscription';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { SocketEvents } from '@/constants/socket-events';

interface UsePaymentWebSocketOptions {
  enabled?: boolean;
  paymentId?: string;
  onPaymentCompleted?: (payment: { paymentId: string; status: string; amount: number; subscriptionId: string | null }) => void;
}

/**
 * WebSocket-only payment notification hook
 * Uses Socket.IO for real-time payment completion notifications
 */
export const usePaymentWebSocket = ({ 
  enabled = true,
  paymentId,
  onPaymentCompleted,
}: UsePaymentWebSocketOptions = {}) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const handlersRegisteredRef = useRef(false);
  const subscribedRef = useRef(false);
  const onPaymentCompletedRef = useRef(onPaymentCompleted);
  const processedPaymentIdsRef = useRef<Set<string>>(new Set());

  // Update ref when callback changes
  useEffect(() => {
    onPaymentCompletedRef.current = onPaymentCompleted;
  }, [onPaymentCompleted]);

  // Process payment completion notification (idempotent)
  const processPaymentCompleted = useCallback((
    data: { paymentId: string; status: string; amount: number; subscriptionId: string | null }
  ) => {
    console.log('💰 [PaymentWebSocket] processPaymentCompleted called:', {
      paymentId: data.paymentId,
      status: data.status,
      amount: data.amount,
      subscriptionId: data.subscriptionId,
      expectedPaymentId: paymentId,
      timestamp: new Date().toISOString(),
    });

    // Idempotency check: prevent duplicate processing
    if (processedPaymentIdsRef.current.has(data.paymentId)) {
      console.log(`⚠️ [PaymentWebSocket] Payment ${data.paymentId} already processed, skipping duplicate notification`, {
        processedPayments: Array.from(processedPaymentIdsRef.current),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // If paymentId is specified, only process if it matches
    if (paymentId && data.paymentId !== paymentId) {
      console.log(`⚠️ [PaymentWebSocket] Payment ID mismatch, skipping:`, {
        receivedPaymentId: data.paymentId,
        expectedPaymentId: paymentId,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Mark as processed immediately to prevent race conditions
    processedPaymentIdsRef.current.add(data.paymentId);

    console.log(`💰 [PaymentWebSocket] Processing payment completion:`, {
      paymentId: data.paymentId,
      status: data.status,
      amount: data.amount,
      subscriptionId: data.subscriptionId,
      timestamp: new Date().toISOString(),
    });
    
    // Invalidate payment queries
    console.log('🔄 [PaymentWebSocket] Invalidating payment queries...');
    queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.paymentId) });
    queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    
    // Invalidate subscription queries
    console.log('🔄 [PaymentWebSocket] Invalidating subscription queries...');
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    
    // Call callback if provided
    if (onPaymentCompletedRef.current) {
      console.log(`💰 [PaymentWebSocket] Calling onPaymentCompleted callback...`, {
        hasCallback: !!onPaymentCompletedRef.current,
        timestamp: new Date().toISOString(),
      });
      onPaymentCompletedRef.current(data);
      console.log(`✅ [PaymentWebSocket] onPaymentCompleted callback executed`);
    } else {
      console.log(`⚠️ [PaymentWebSocket] No onPaymentCompleted callback provided`);
    }
  }, [paymentId, queryClient]);

  useEffect(() => {
    console.log('🔌 [PaymentWebSocket] useEffect triggered', {
      enabled,
      paymentId,
      timestamp: new Date().toISOString(),
    });

    if (!enabled) {
      console.log('⚠️ [PaymentWebSocket] Hook disabled (modal closed), but keeping socket connected for late webhooks');
      // CRITICAL FIX: Don't disconnect when modal closes
      // Keep socket connected to receive late webhook events
      // Only update UI state, don't disconnect socket
      setIsConnected(false);
      // Don't return - let the cleanup function handle everything
      // The socket will stay connected but listeners won't be active
      return;
    }

    tokenRef.current = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
    console.log('🔑 [PaymentWebSocket] Token retrieved:', {
      hasToken: !!tokenRef.current,
      tokenLength: tokenRef.current?.length,
      timestamp: new Date().toISOString(),
    });

    const handlePaymentCompleted = (data: { 
      paymentId: string; 
      status: string; 
      amount: number; 
      subscriptionId: string | null;
    }) => {
      console.log('💰 [PaymentWebSocket] handlePaymentCompleted called:', {
        event: 'payment:completed',
        data,
        expectedPaymentId: paymentId,
        matches: paymentId ? data.paymentId === paymentId : 'no filter',
        timestamp: new Date().toISOString(),
      });
      processPaymentCompleted(data);
    };

    const handlePaymentStatusUpdated = (data: { 
      paymentId: string; 
      status: string; 
      amount: number;
    }) => {
      console.log('💰 [PaymentWebSocket] Payment status updated via WebSocket:', {
        event: 'payment:status-updated',
        data,
        timestamp: new Date().toISOString(),
      });
      
      // Invalidate payment queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(data.paymentId) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    };

    const setupConnection = async () => {
      console.log('🔌 [PaymentWebSocket] Starting connection setup...', {
        enabled,
        paymentId,
        namespace: '/payments',
        timestamp: new Date().toISOString(),
      });

      try {
        console.log('🔌 [PaymentWebSocket] Calling websocketService.connectWithAuth("/payments")...');
        const socket = await websocketService.connectWithAuth('/payments');
        
        console.log('🔌 [PaymentWebSocket] Socket instance received:', {
          socketId: socket.id,
          connected: socket.connected,
          disconnected: socket.disconnected,
          namespace: socket.nsp,
        });
        
        const updateConnectionState = () => {
          const connected = websocketService.isConnected();
          setIsConnected(connected);
          console.log('🔌 [PaymentWebSocket] Connection state updated:', {
            isConnected: connected,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });
        };

        updateConnectionState();

        const subscribePaymentRoom = async () => {
          if (paymentId && !subscribedRef.current) {
            try {
              console.log('🪝 [PaymentWebSocket] Subscribing to payment room', { paymentId });
              const result = await websocketService.subscribeToPayment(paymentId);
              if (result.success) {
                subscribedRef.current = true;
                console.log('✅ [PaymentWebSocket] Subscribed to payment room', { paymentId });
              }
            } catch (error) {
              console.error('❌ [PaymentWebSocket] Failed to subscribe to payment room', {
                paymentId,
                error,
              });
            }
          }
        };

        // Register listeners to websocketService (for persistence across reconnections)
        // But also register directly to socket for immediate effect
        const registerListeners = () => {
          console.log('📝 [PaymentWebSocket] Registering WebSocket listeners...', {
            events: [
              SocketEvents.SERVER_TO_CLIENT.PAYMENT_COMPLETED,
              SocketEvents.SERVER_TO_CLIENT.PAYMENT_STATUS_UPDATED,
            ],
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });

          // Register via websocketService for persistence
          if (!handlersRegisteredRef.current) {
            websocketService.on(SocketEvents.SERVER_TO_CLIENT.PAYMENT_COMPLETED, handlePaymentCompleted);
            websocketService.on(SocketEvents.SERVER_TO_CLIENT.PAYMENT_STATUS_UPDATED, handlePaymentStatusUpdated);
            handlersRegisteredRef.current = true;
            console.log('✅ [PaymentWebSocket] WebSocket listeners registered via websocketService');
          }

          // Also register directly to socket for immediate effect (CRITICAL FIX)
          // Remove old listeners first to avoid duplicates
          socket.off(SocketEvents.SERVER_TO_CLIENT.PAYMENT_COMPLETED);
          socket.off(SocketEvents.SERVER_TO_CLIENT.PAYMENT_STATUS_UPDATED);
          
          socket.on(SocketEvents.SERVER_TO_CLIENT.PAYMENT_COMPLETED, (data: { 
            paymentId: string; 
            status: string; 
            amount: number; 
            subscriptionId: string | null;
          }) => {
            console.log('🎯 [PaymentWebSocket] Direct socket listener received payment:completed:', {
              event: 'payment:completed',
              data,
              socketId: socket.id,
              timestamp: new Date().toISOString(),
            });
            handlePaymentCompleted(data);
          });
          
          socket.on(SocketEvents.SERVER_TO_CLIENT.PAYMENT_STATUS_UPDATED, (data: { 
            paymentId: string; 
            status: string; 
            amount: number;
          }) => {
            console.log('🎯 [PaymentWebSocket] Direct socket listener received payment:status-updated:', {
              event: 'payment:status-updated',
              data,
              socketId: socket.id,
              timestamp: new Date().toISOString(),
            });
            handlePaymentStatusUpdated(data);
          });

          console.log('✅ [PaymentWebSocket] Direct socket listeners registered successfully');
        };

        const onConnect = () => {
          console.log('✅ [PaymentWebSocket] CONNECTED to /payments namespace', {
            socketId: socket.id,
            namespace: socket.nsp,
            transport: socket.io.engine?.transport?.name,
            timestamp: new Date().toISOString(),
          });
          updateConnectionState();
          
          // CRITICAL FIX: Register listeners AFTER connection is established
          registerListeners();
          void subscribePaymentRoom();
        };

        const onDisconnect = (reason: string) => {
          setIsConnected(false);
          subscribedRef.current = false;
          console.log('❌ [PaymentWebSocket] DISCONNECTED', {
            reason,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });
        };

        socket.on(SocketEvents.SERVER_TO_CLIENT.CONNECT, onConnect);
        socket.on(SocketEvents.SERVER_TO_CLIENT.DISCONNECT, onDisconnect);

        // CRITICAL FIX: Register listeners immediately if already connected
        if (socket.connected) {
          console.log('🔌 [PaymentWebSocket] Socket already connected, registering listeners immediately...');
          updateConnectionState();
          registerListeners();
          void subscribePaymentRoom();
        }
      } catch (error) {
        console.error('❌ [PaymentWebSocket] Failed to connect to payment websocket:', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        setIsConnected(false);
      }
    };

    const tokenUnsubscribe = websocketService.onTokenUpdate(() => {
      const currentToken = localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
      
      console.log('🔄 [PaymentWebSocket] Token update detected', {
        hasNewToken: !!currentToken,
        tokenChanged: currentToken !== tokenRef.current,
        timestamp: new Date().toISOString(),
      });
      
      if (currentToken !== tokenRef.current) {
        console.log('🔄 [PaymentWebSocket] Token updated, reconnecting payment websocket...', {
          oldTokenLength: tokenRef.current?.length,
          newTokenLength: currentToken?.length,
          timestamp: new Date().toISOString(),
        });
        tokenRef.current = currentToken;
        websocketService.disconnect();
        setIsConnected(false);
        setTimeout(() => {
          console.log('🔄 [PaymentWebSocket] Reconnecting after token update...');
          setupConnection();
        }, 100);
      } else {
        tokenRef.current = currentToken;
      }
    });

    setupConnection();

    return () => {
      console.log('🧹 [PaymentWebSocket] Cleaning up...', {
        enabled,
        timestamp: new Date().toISOString(),
      });
      tokenUnsubscribe();
      if (subscribedRef.current && paymentId) {
        websocketService.unsubscribeFromPayment(paymentId).catch(() => {});
        subscribedRef.current = false;
      }
      
      if (handlersRegisteredRef.current) {
        console.log('🧹 [PaymentWebSocket] Removing WebSocket listeners...');
        websocketService.off(SocketEvents.SERVER_TO_CLIENT.PAYMENT_COMPLETED, handlePaymentCompleted);
        websocketService.off(SocketEvents.SERVER_TO_CLIENT.PAYMENT_STATUS_UPDATED, handlePaymentStatusUpdated);
        handlersRegisteredRef.current = false;
        console.log('✅ [PaymentWebSocket] Cleanup completed');
      }

      // CRITICAL FIX: Don't disconnect socket when modal closes if payment is still PENDING
      // Allow connection to persist to receive late webhook events
      // Only disconnect if explicitly needed (component unmount)
      // Note: We keep the socket connected even when modal closes to handle late webhooks
      // The socket will be reused if modal opens again for the same payment
      // CRITICAL FIX: Only disconnect if component is unmounting completely
      // Don't disconnect just because modal closed - keep connection for late webhooks
      // The cleanup function below will handle proper cleanup
      console.log('🧹 [PaymentWebSocket] Cleanup completed (socket remains connected for late webhooks)');
    };
  }, [enabled, queryClient, processPaymentCompleted]);

  return {
    isConnected: isConnected || websocketService.isConnected(),
  };
};

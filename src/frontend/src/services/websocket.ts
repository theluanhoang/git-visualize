import { io, Socket } from 'socket.io-client';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { SocketEvents } from '@/constants/socket-events';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
type ConnectionStatus = 'healthy' | 'degraded' | 'failed';

interface ConnectionConfig {
  namespace: string;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  reconnectDelayMax: number;
  pingTimeout: number;
  pingInterval: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private currentNamespace: string | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private connectionStatus: ConnectionStatus = 'healthy';
  private tokenUpdateListeners: Set<() => void> = new Set();
  private storageEventListener: ((e: StorageEvent) => void) | null = null;
  private reconnectAttempts = 0;
  private lastPingTime: number | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  private config: ConnectionConfig = {
    namespace: '/ratings',
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    reconnectDelayMax: 5000,
    pingTimeout: 60000,
    pingInterval: 25000,
  };

  private getToken(): string | null {
    return localStorageHelpers.getItem(LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN);
  }

  onTokenUpdate(callback: () => void): () => void {
    this.tokenUpdateListeners.add(callback);
    return () => {
      this.tokenUpdateListeners.delete(callback);
    };
  }

  private notifyTokenUpdate(): void {
    this.tokenUpdateListeners.forEach((callback) => {
      try {
        callback();
      } catch (error) {
      }
    });
  }

  private setupTokenMonitoring(): void {
    this.storageEventListener = (e: StorageEvent) => {
      if (e.key === LOCALSTORAGE_KEYS.AUTH.ACCESS_TOKEN) {
        this.notifyTokenUpdate();
      }
    };
    
    window.addEventListener('storage', this.storageEventListener);
  }

  private cleanupTokenMonitoring(): void {
    if (this.storageEventListener) {
      window.removeEventListener('storage', this.storageEventListener);
      this.storageEventListener = null;
    }
  }

  updateToken(): void {
    const newToken = this.getToken();
    const currentToken = (this.socket?.auth as any)?.token;
    
    if (newToken && newToken !== currentToken && this.socket) {
      console.log('🔄 Updating WebSocket token, reconnecting...');
      this.disconnect();
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.connect(this.config.namespace);
        }
      }, 100);
    }
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      if (!this.socket?.connected) {
        return;
      }

      const now = Date.now();
      if (this.lastPingTime && (now - this.lastPingTime) > this.config.pingTimeout) {
        this.connectionStatus = 'failed';
      } else {
        this.connectionStatus = 'healthy';
      }
    }, this.config.pingInterval);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private createSocket(namespace: string): Socket {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
    const baseURL = apiUrl.replace(/\/api\/?.*$/, '') || 'http://localhost:8000';
    
    const token = this.getToken();
    const socketUrl = `${baseURL}${namespace}`;

    console.log('🔌 [WebSocketService] Creating socket connection', {
      namespace,
      baseURL,
      socketUrl,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.config.reconnectDelay,
      reconnectionDelayMax: this.config.reconnectDelayMax,
      reconnectionAttempts: this.config.maxReconnectAttempts,
      timeout: 20000,
      auth: {
        token: token || undefined,
      },
      upgrade: true,
      rememberUpgrade: true,
      forceNew: false,
    });

    this.socket.on(SocketEvents.SERVER_TO_CLIENT.CONNECT, () => {
      this.connectionState = 'connected';
      this.connectionStatus = 'healthy';
      this.reconnectAttempts = 0;
      this.lastPingTime = Date.now();
      
      const actualNamespace = (this.socket as any)?.nsp?.name || namespace;
      console.log(`✅ [WebSocketService] CONNECTED to ${namespace}`, {
        namespace,
        actualNamespace,
        socketId: this.socket?.id,
        socketUrl: (this.socket as any)?.io?.uri,
        transport: (this.socket as any)?.io?.engine?.transport?.name,
        timestamp: new Date().toISOString(),
      });
      
      // Verify namespace matches
      if (actualNamespace !== namespace) {
        console.error(`❌ [WebSocketService] Namespace mismatch! Expected: ${namespace}, Actual: ${actualNamespace}`);
      }
      
      // Register all listeners from Map to the connected socket
      const listenerCount = Array.from(this.listeners.values()).reduce((sum, callbacks) => sum + callbacks.size, 0);
      console.log(`📝 [WebSocketService] Registering ${listenerCount} listener(s) for ${namespace}`, {
        namespace,
        listenerCount,
        events: Array.from(this.listeners.keys()),
        timestamp: new Date().toISOString(),
      });
      
      // Remove any existing listeners first to avoid duplicates
      this.listeners.forEach((callbacks, event) => {
        // Remove all existing listeners for this event
        this.socket?.removeAllListeners(event);
        
        // Register all callbacks for this event
        callbacks.forEach((callback) => {
          // Wrap callback to add logging
          const wrappedCallback = (...args: any[]) => {
            console.log(`📨 [WebSocketService] Event received: ${event}`, {
              event,
              namespace,
              socketId: this.socket?.id,
              args,
              timestamp: new Date().toISOString(),
            });
            callback(...args);
          };
          this.socket?.on(event, wrappedCallback);
          console.log(`  📌 [WebSocketService] Registered listener for event: ${event}`, {
            namespace,
            event,
            timestamp: new Date().toISOString(),
          });
        });
      });

      // Debug: Log all registered events (if available)
      if (process.env.NODE_ENV === 'development' && this.socket) {
        try {
          // socket.io-client doesn't have eventNames(), but we can log what we registered
          const registeredEvents = Array.from(this.listeners.keys());
          console.log(`  📋 Registered ${registeredEvents.length} event type(s):`, registeredEvents);
        } catch (error) {
          // Ignore if eventNames is not available
        }
      }

      this.startHealthCheck();
    });

    this.socket.on(SocketEvents.SERVER_TO_CLIENT.DISCONNECT, (reason) => {
      if (reason === 'io client disconnect' || reason === 'io server disconnect') {
        this.connectionState = 'disconnected';
        this.stopHealthCheck();
      } else {
        this.connectionState = 'connecting';
      }
    });

    this.socket.on('pong', () => {
      this.lastPingTime = Date.now();
      this.connectionStatus = 'healthy';
    });

    this.socket.on(SocketEvents.SERVER_TO_CLIENT.CONNECT_ERROR, (error) => {
      console.error(`❌ [WebSocketService] CONNECTION ERROR for ${namespace}`, {
        namespace,
        error,
        errorMessage: error?.message,
        timestamp: new Date().toISOString(),
      });
      this.connectionState = 'connecting';
      this.reconnectAttempts++;
      
      const isAuthError = 
        error.message.includes('Unauthorized') || 
        error.message.includes('INVALID_TOKEN') ||
        error.message.includes('UNAUTHORIZED');

      if (isAuthError) {
        const newToken = this.getToken();
        const currentToken = token;
        
        if (newToken && newToken !== currentToken) {
          this.disconnect();
          setTimeout(() => {
            if (!this.socket?.connected) {
              this.connect(namespace);
            }
          }, 500);
        } else if (!newToken) {
          this.socket?.disconnect();
          this.connectionState = 'disconnected';
        }
      }

      if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
        this.connectionStatus = 'failed';
        this.connectionState = 'disconnected';
      } else if (this.reconnectAttempts > 2) {
        this.connectionStatus = 'degraded';
      }
    });

    this.socket.on(SocketEvents.SERVER_TO_CLIENT.ERROR, (error: { message: string; code?: string }) => {
      if (error.code === 'UNAUTHORIZED' || error.code === 'INVALID_TOKEN') {
        const newToken = this.getToken();
        if (newToken) {
          this.disconnect();
          setTimeout(() => {
            if (!this.socket?.connected) {
              this.connect(namespace);
            }
          }, 500);
        }
      }
    });

    this.connectionState = 'connecting';
    return this.socket;
  }

  connect(namespace: string = '/ratings'): Socket {
    this.config.namespace = namespace;

    console.log('🔌 [WebSocketService] connect called', {
      namespace,
      currentNamespace: this.currentNamespace,
      hasSocket: !!this.socket,
      isConnected: this.socket?.connected,
      connectionState: this.connectionState,
      timestamp: new Date().toISOString(),
    });

    if (this.socket?.connected && this.currentNamespace === namespace) {
      console.log('✅ [WebSocketService] Already connected to same namespace, returning existing socket', {
        namespace,
        socketId: this.socket.id,
      });
      return this.socket;
    }

    if (this.socket && this.currentNamespace === namespace && this.connectionState === 'connecting') {
      console.log('⏳ [WebSocketService] Connection in progress to same namespace, returning existing socket', {
        namespace,
      });
      return this.socket;
    }

    if (this.socket) {
      if (this.currentNamespace !== namespace || this.connectionState === 'disconnected') {
        console.log('🔄 [WebSocketService] Disconnecting existing socket to connect to new namespace', {
          oldNamespace: this.currentNamespace,
          newNamespace: namespace,
        });
        this.disconnect();
      }
    }

    this.currentNamespace = namespace;
    console.log('🆕 [WebSocketService] Creating new socket connection', {
      namespace,
      timestamp: new Date().toISOString(),
    });
    return this.createSocket(namespace);
  }

  async connectWithAuth(namespace: string = '/ratings'): Promise<Socket> {
    console.log('🔌 [WebSocketService] connectWithAuth called', {
      namespace,
      currentNamespace: this.currentNamespace,
      isConnected: this.socket?.connected,
      connectionState: this.connectionState,
      timestamp: new Date().toISOString(),
    });

    if (this.socket?.connected && this.currentNamespace === namespace) {
      console.log('✅ [WebSocketService] Already connected to namespace, returning existing socket', {
        namespace,
        socketId: this.socket.id,
      });
      return this.socket;
    }

    if (this.socket && this.currentNamespace === namespace && this.connectionState === 'connecting') {
      console.log('⏳ [WebSocketService] Connection in progress, waiting...', { namespace });
      return new Promise<Socket>((resolve, reject) => {
        if (this.socket?.connected) {
          console.log('✅ [WebSocketService] Socket connected while waiting', {
            socketId: this.socket.id,
          });
          resolve(this.socket);
          return;
        }

        const onConnect = () => {
          console.log('✅ [WebSocketService] Connected while waiting', {
            namespace,
            socketId: this.socket?.id,
          });
          cleanup();
          if (this.socket?.connected) {
            resolve(this.socket);
          } else {
            reject(new Error('Connection failed'));
          }
        };

        const onConnectError = (error: any) => {
          console.error('❌ [WebSocketService] Connection error while waiting', {
            namespace,
            error,
            errorMessage: error?.message,
          });
          cleanup();
          reject(error);
        };

        const onDisconnect = () => {
          console.log('⚠️ [WebSocketService] Disconnected while waiting, reconnecting...', {
            namespace,
          });
          cleanup();
          resolve(this.connect(namespace));
        };

        const cleanup = () => {
          this.socket?.off(SocketEvents.SERVER_TO_CLIENT.CONNECT, onConnect);
          this.socket?.off(SocketEvents.SERVER_TO_CLIENT.CONNECT_ERROR, onConnectError);
          this.socket?.off(SocketEvents.SERVER_TO_CLIENT.DISCONNECT, onDisconnect);
        };

        if (this.socket) {
          this.socket.once(SocketEvents.SERVER_TO_CLIENT.CONNECT, onConnect);
          this.socket.once(SocketEvents.SERVER_TO_CLIENT.CONNECT_ERROR, onConnectError);
          this.socket.once(SocketEvents.SERVER_TO_CLIENT.DISCONNECT, onDisconnect);
        } else {
          resolve(this.connect(namespace));
        }
      });
    }

    console.log('🔌 [WebSocketService] Creating new connection...', { namespace });
    return this.connect(namespace);
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 [WebSocketService] Disconnecting socket', {
        socketId: this.socket.id,
        namespace: this.currentNamespace,
        connected: this.socket.connected,
        timestamp: new Date().toISOString(),
      });
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.currentNamespace = null;
      this.connectionState = 'disconnected';
      this.connectionStatus = 'disconnected';
      this.stopHealthCheck();
      this.reconnectAttempts = 0;
      console.log('✅ [WebSocketService] Socket disconnected successfully');
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    if (this.socket && this.socket.connected) {
      this.socket.on(event, callback);
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 Registered listener for event: ${event} on connected socket`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Added listener for event: ${event} to Map (socket not connected yet)`);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  subscribeToLesson(lessonId: string): Promise<{ success: boolean; lessonId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Subscribe timeout'));
      }, 5000);

      this.socket.emit(SocketEvents.CLIENT_TO_SERVER.SUBSCRIBE_LESSON, { lessonId }, (response: any) => {
        clearTimeout(timeout);
        
        if (response && response.success === true) {
          resolve(response);
        } else if (response && response.success === false) {
          reject(new Error(response.message || 'Failed to subscribe'));
        } else {
          const error = response?.error || response;
          reject(new Error(error?.message || 'Failed to subscribe'));
        }
      });
    });
  }

  unsubscribeFromLesson(lessonId: string): Promise<{ success: boolean; lessonId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Unsubscribe timeout'));
      }, 5000);

      this.socket.emit(SocketEvents.CLIENT_TO_SERVER.UNSUBSCRIBE_LESSON, { lessonId }, (response: any) => {
        clearTimeout(timeout);
        
        if (response && response.success === true) {
          resolve(response);
        } else if (response && response.success === false) {
          reject(new Error(response.message || 'Failed to unsubscribe'));
        } else {
          const error = response?.error || response;
          reject(new Error(error?.message || 'Failed to unsubscribe'));
        }
      });
    });
  }

  subscribeToPayment(paymentId: string): Promise<{ success: boolean; paymentId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Subscribe payment timeout'));
      }, 5000);

      this.socket.emit(SocketEvents.CLIENT_TO_SERVER.SUBSCRIBE_PAYMENT, { paymentId }, (response: any) => {
        clearTimeout(timeout);
        
        if (response && response.success === true) {
          resolve(response);
        } else if (response && response.success === false) {
          reject(new Error(response.message || 'Failed to subscribe payment'));
        } else {
          const error = response?.error || response;
          reject(new Error(error?.message || 'Failed to subscribe payment'));
        }
      });
    });
  }

  unsubscribeFromPayment(paymentId: string): Promise<{ success: boolean; paymentId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Unsubscribe payment timeout'));
      }, 5000);

      this.socket.emit(SocketEvents.CLIENT_TO_SERVER.UNSUBSCRIBE_PAYMENT, { paymentId }, (response: any) => {
        clearTimeout(timeout);
        
        if (response && response.success === true) {
          resolve(response);
        } else if (response && response.success === false) {
          reject(new Error(response.message || 'Failed to unsubscribe payment'));
        } else {
          const error = response?.error || response;
          reject(new Error(error?.message || 'Failed to unsubscribe payment'));
        }
      });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  initialize(): void {
    this.setupTokenMonitoring();
  }

  destroy(): void {
    this.disconnect();
    this.cleanupTokenMonitoring();
    this.tokenUpdateListeners.clear();
    this.listeners.clear();
  }
}

export const websocketService = new WebSocketService();

if (typeof window !== 'undefined') {
  websocketService.initialize();
}

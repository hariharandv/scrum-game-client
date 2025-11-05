// WebSocket Client Service for Real-time Game Updates
// Handles live synchronization with the backend WebSocket server

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface GameUpdateMessage extends WebSocketMessage {
  type: 'game_update';
  payload: {
    gameState: any;
    action: string;
    player?: string;
  };
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private listeners: Map<string, ((message: WebSocketMessage) => void)[]> = new Map();
  private url: string;

  constructor(url: string = 'ws://localhost:5000') {
    this.url = url;
  }

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.reconnectInterval = 1000;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Subscribe to game updates
  subscribeToGame(gameId?: string): void {
    this.send({
      type: 'subscribe_game',
      payload: { gameId },
      timestamp: Date.now()
    });
  }

  // Send player action
  sendPlayerAction(action: string, data: any): void {
    this.send({
      type: 'player_action',
      payload: {
        action,
        player: 'current_player', // TODO: Get from context
        data
      },
      timestamp: Date.now()
    });
  }

  // Send ping to keep connection alive
  ping(): void {
    this.send({
      type: 'ping',
      payload: {},
      timestamp: Date.now()
    });
  }

  // Add event listener
  on(event: string, callback: (message: WebSocketMessage) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Remove event listener
  off(event: string, callback: (message: WebSocketMessage) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Send message to server
  private send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    console.log('Received WebSocket message:', message.type);

    // Emit to specific event listeners
    const eventListeners = this.listeners.get(message.type);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(message));
    }

    // Emit to wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(message));
    }
  }

  // Attempt to reconnect with exponential backoff
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval}ms`);

    setTimeout(() => {
      this.connect().catch(() => {
        this.reconnectInterval *= 2; // Exponential backoff
        this.attemptReconnect();
      });
    }, this.reconnectInterval);
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const webSocketClient = new WebSocketClient();
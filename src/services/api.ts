// API Client Service for Scrum Game
// Handles all communication with the backend REST API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'UNKNOWN_ERROR',
            message: data.error?.message || 'An unknown error occurred',
          },
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
        },
      };
    }
  }

  // Game API methods
  async startGame(): Promise<ApiResponse<any>> {
    return this.request('/game/start', { method: 'POST' });
  }

  async getGameState(): Promise<ApiResponse<any>> {
    return this.request('/game/state');
  }

  async advancePhase(): Promise<ApiResponse<any>> {
    return this.request('/game/phase', { method: 'POST' });
  }

  async rollD6(cardId: string): Promise<ApiResponse<any>> {
    return this.request('/game/roll-d6', {
      method: 'POST',
      body: JSON.stringify({ cardId }),
    });
  }

  async getMetrics(): Promise<ApiResponse<any>> {
    return this.request('/game/metrics');
  }

  // Board API methods
  async getBoardState(): Promise<ApiResponse<any>> {
    return this.request('/board/');
  }

  async moveCard(cardId: string, fromColumn: string, toColumn: string): Promise<ApiResponse<any>> {
    return this.request('/board/move-card', {
      method: 'POST',
      body: JSON.stringify({ cardId, fromColumn, toColumn }),
    });
  }

  async pullToSprint(cardIds: string[]): Promise<ApiResponse<any>> {
    return this.request('/board/pull-to-sprint', {
      method: 'POST',
      body: JSON.stringify({ cardIds }),
    });
  }

  async allocateCapacity(cardId: string, effort: number): Promise<ApiResponse<any>> {
    return this.request('/board/allocate-capacity', {
      method: 'POST',
      body: JSON.stringify({ cardId, effort }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
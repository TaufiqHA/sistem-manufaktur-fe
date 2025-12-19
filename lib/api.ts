const API_BASE_URL = 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  };
  token: string;
  token_type: string;
}

interface LogoutRequest {
  // No body required
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RefreshTokenResponse {
  token: string;
  token_type: string;
}

interface ProjectData {
  id?: number;
  code: string;
  name: string;
  customer: string;
  start_date: string;
  deadline: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  progress: number;
  qty_per_unit: number;
  procurement_qty: number;
  total_qty: number;
  unit: string;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProjectsListResponse {
  data: ProjectData[];
}

interface ProjectResponse {
  data: ProjectData;
}

interface ProjectCreateRequest {
  code: string;
  name: string;
  customer: string;
  start_date: string;
  deadline: string;
  status: string;
  progress: number;
  qty_per_unit: number;
  procurement_qty: number;
  total_qty: number;
  unit: string;
  is_locked: boolean;
}

interface DeleteResponse {
  message: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data: ApiResponse<T>;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        // Non-JSON response (likely error HTML page)
        const text = await response.text();
        data = {
          success: false,
          message: `Server error (${response.status}): ${text.substring(0, 100)}...`,
        };
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - clear token and redirect to login if needed
          this.clearToken();
        }
        // Return error response as-is
        return data;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(
      '/login',
      'POST',
      { email, password },
      false
    );
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    return this.request<LogoutResponse>('/logout', 'POST', {}, true);
  }

  async getUserProfile(): Promise<ApiResponse<UserProfileResponse>> {
    return this.request<UserProfileResponse>('/user', 'GET', undefined, true);
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.request<RefreshTokenResponse>('/refresh', 'POST', {}, true);
  }

  // Project API Methods
  async getProjects(): Promise<ApiResponse<ProjectsListResponse>> {
    return this.request<ProjectsListResponse>('/projects', 'GET', undefined, true);
  }

  async getProject(id: string | number): Promise<ApiResponse<ProjectResponse>> {
    return this.request<ProjectResponse>(`/projects/${id}`, 'GET', undefined, true);
  }

  async createProject(data: ProjectCreateRequest): Promise<ApiResponse<ProjectResponse>> {
    return this.request<ProjectResponse>('/projects', 'POST', data, true);
  }

  async updateProject(id: string | number, data: Partial<ProjectCreateRequest>): Promise<ApiResponse<ProjectResponse>> {
    return this.request<ProjectResponse>(`/projects/${id}`, 'PUT', data, true);
  }

  async deleteProject(id: string | number): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(`/projects/${id}`, 'DELETE', {}, true);
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const apiClient = new ApiClient();
export type {
  LoginResponse,
  UserProfileResponse,
  ApiResponse,
  ProjectData,
  ProjectsListResponse,
  ProjectResponse,
  ProjectCreateRequest,
  DeleteResponse
};

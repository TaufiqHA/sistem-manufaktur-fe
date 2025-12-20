const API_BASE_URL = "https://api.manufactur.id/api";

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

interface UserData {
  id?: number;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "MANAGER";
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  permissions?: Record<string, Record<string, boolean>>;
}

interface UsersListResponse {
  data: UserData[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
  };
}

interface UserResponse {
  data: UserData;
}

interface UserCreateRequest {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role?: "ADMIN" | "OPERATOR" | "MANAGER";
  permissions?: Record<string, Record<string, boolean>> | string[];
}

interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: "ADMIN" | "OPERATOR" | "MANAGER";
  password?: string;
  password_confirmation?: string;
  permissions?: Record<string, Record<string, boolean>> | string[];
}

interface ProjectData {
  id?: number;
  code: string;
  name: string;
  customer: string;
  start_date: string;
  deadline: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
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

interface MachinePersonnelData {
  id?: string | number;
  name: string;
  position?: string;
  role?: string;
  shift?: string;
}

interface MachineData {
  id?: number;
  code: string;
  name: string;
  type: "POTONG" | "PLONG" | "PRESS" | "LAS" | "WT" | "POWDER" | "QC";
  capacity_per_hour: number;
  status: "IDLE" | "RUNNING" | "MAINTENANCE" | "OFFLINE" | "DOWNTIME";
  personnel: MachinePersonnelData[];
  is_maintenance: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MachinesListResponse {
  data: MachineData[];
}

interface MachineResponse {
  data: MachineData;
}

interface MachineCreateRequest {
  code: string;
  name: string;
  type: "POTONG" | "PLONG" | "PRESS" | "LAS" | "WT" | "POWDER" | "QC";
  capacity_per_hour: number;
  status: "IDLE" | "RUNNING" | "MAINTENANCE" | "OFFLINE" | "DOWNTIME";
  personnel: MachinePersonnelData[];
  is_maintenance: boolean;
}

interface MaterialData {
  id?: number;
  code: string;
  name: string;
  unit: string;
  current_stock: number;
  safety_stock: number;
  price_per_unit: number;
  category: "RAW" | "FINISHING" | "HARDWARE";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

interface MaterialsListResponse {
  data: {
    data: MaterialData[];
    links?: {
      first?: string;
      last?: string;
      prev?: string;
      next?: string;
    };
    meta?: {
      current_page: number;
      from: number;
      last_page: number;
      path: string;
      per_page: number;
      to: number;
      total: number;
    };
  };
}

interface MaterialResponse {
  data: MaterialData;
}

interface MaterialCreateRequest {
  code: string;
  name: string;
  unit: string;
  current_stock: number;
  safety_stock: number;
  price_per_unit: number;
  category: "RAW" | "FINISHING" | "HARDWARE";
}

interface StockAdjustmentRequest {
  stock_change: number;
  operation: "add" | "reduce";
}

interface ProjectItemData {
  id?: number;
  project_id: string | number;
  name: string;
  dimensions: string;
  thickness: string;
  qty_set: number;
  quantity: number;
  unit: string;
  is_bom_locked?: boolean;
  is_workflow_locked?: boolean;
  workflow?: any[];
  created_at?: string;
  updated_at?: string;
}

interface ProjectItemsListResponse {
  data: ProjectItemData[];
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

interface ProjectItemResponse {
  data: ProjectItemData;
}

interface ProjectItemCreateRequest {
  project_id: string | number;
  name: string;
  dimensions: string;
  thickness: string;
  qty_set: number;
  quantity: number;
  unit: string;
  is_bom_locked?: boolean;
  is_workflow_locked?: boolean;
  workflow?: any[];
}

interface BomItemData {
  id?: number;
  item_id: string | number;
  material_id: string | number;
  quantity_per_unit: number;
  total_required: number;
  allocated: number;
  realized: number;
  created_at?: string;
  updated_at?: string;
  item?: {
    id: number;
    project_id: string | number;
    name: string;
    dimensions: string;
    thickness: string;
    qty_set: number;
    quantity: number;
    unit: string;
    is_bom_locked: boolean;
    is_workflow_locked: boolean;
    workflow: any[];
    created_at?: string;
    updated_at?: string;
  };
  material?: {
    id: number;
    code: string;
    name: string;
    unit: string;
    current_stock: number;
    safety_stock: number;
    price_per_unit: string | number;
    category: "RAW" | "FINISHING" | "HARDWARE";
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  };
}

interface BomItemsListResponse {
  data: BomItemData[];
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

interface BomItemResponse {
  data: BomItemData;
}

interface BomItemCreateRequest {
  item_id: string | number;
  material_id: string | number;
  quantity_per_unit: number;
  total_required: number;
  allocated: number;
  realized: number;
}

interface TaskData {
  id?: number;
  project_id: string | number;
  project_name: string;
  item_id: string | number;
  item_name: string;
  step: string;
  machine_id: string | number;
  target_qty: number;
  completed_qty: number;
  defect_qty: number;
  status: "PENDING" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "DOWNTIME";
  shift?: string;
  downtime_start?: string | null;
  total_downtime_minutes: number;
  created_at?: string;
  updated_at?: string;
  machine?: MachineData;
}

interface TasksListResponse {
  data: TaskData[];
  current_page?: number;
  from?: number;
  last_page?: number;
  path?: string;
  per_page?: number;
  to?: number;
  total?: number;
  links?: any[];
}

interface TaskResponse {
  success: boolean;
  message?: string;
  data: TaskData;
}

interface TaskCreateRequest {
  project_id: string | number;
  project_name: string;
  item_id: string | number;
  item_name: string;
  step: string;
  machine_id: string | number;
  target_qty: number;
  completed_qty?: number;
  defect_qty?: number;
  status: string;
  shift?: string;
  downtime_start?: string | null;
  total_downtime_minutes?: number;
}

interface TaskStatusRequest {
  status: "PENDING" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "DOWNTIME";
}

interface TaskQuantitiesRequest {
  completed_qty: number;
  defect_qty: number;
}

interface DeleteResponse {
  message: string;
}

interface BackupData {
  id: number;
  filename: string;
  path: string;
  disk: string;
  size: number | null;
  status: "pending" | "processing" | "completed" | "failed";
  type: "full" | "incremental" | "selective";
  details?: {
    tables?: string[];
    excluded_tables?: string[];
    compression?: string;
    encrypted?: boolean;
  };
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface BackupsListResponse {
  data: BackupData[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
  };
}

interface BackupStatsResponse {
  total_backups: number;
  total_size_bytes: number;
  total_size_formatted: string;
  latest_backup?: BackupData;
  status_counts: {
    completed: number;
    processing: number;
    failed: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
    body?: unknown,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: "include",
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      // Handle 204 No Content (successful DELETE responses)
      if (response.status === 204) {
        return {
          success: true,
          message: "Success",
          data: undefined as any,
        };
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let data: ApiResponse<T>;

      if (contentType?.includes("application/json")) {
        const jsonData = await response.json();
        // If backend doesn't include 'success' field, set it based on HTTP status
        if (jsonData.success === undefined) {
          data = {
            success: response.ok,
            message: jsonData.message,
            data: jsonData.data || jsonData,
          };
        } else {
          data = jsonData;
        }
      } else {
        // Non-JSON response (likely error HTML page)
        const text = await response.text();
        data = {
          success: false,
          message: `Server error (${response.status}): ${text.substring(
            0,
            100
          )}...`,
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
      console.error("API request failed:", error);
      return {
        success: false,
        message: `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(
      "/login",
      "POST",
      { email, password },
      false
    );
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    return this.request<LogoutResponse>("/logout", "POST", {}, true);
  }

  async getUserProfile(): Promise<ApiResponse<UserProfileResponse>> {
    return this.request<UserProfileResponse>("/user", "GET", undefined, true);
  }

  async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.request<RefreshTokenResponse>("/refresh", "POST", {}, true);
  }

  // User Management API Methods
  async getUsers(
    page: number = 1,
    perPage: number = 15,
    search?: string
  ): Promise<ApiResponse<UsersListResponse>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (search) params.append("search", search);
    return this.request<UsersListResponse>(
      `/users?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getUser(id: string | number): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>(`/users/${id}`, "GET", undefined, true);
  }

  async createUser(
    data: UserCreateRequest
  ): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>("/users", "POST", data, true);
  }

  async updateUser(
    id: string | number,
    data: UserUpdateRequest
  ): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>(`/users/${id}`, "PUT", data, true);
  }

  async deleteUser(id: string | number): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(`/users/${id}`, "DELETE", {}, true);
  }

  // Project API Methods
  async getProjects(): Promise<ApiResponse<ProjectsListResponse>> {
    return this.request<ProjectsListResponse>(
      "/projects",
      "GET",
      undefined,
      true
    );
  }

  async getProject(id: string | number): Promise<ApiResponse<ProjectResponse>> {
    return this.request<ProjectResponse>(
      `/projects/${id}`,
      "GET",
      undefined,
      true
    );
  }

  async createProject(
    data: ProjectCreateRequest
  ): Promise<ApiResponse<ProjectResponse>> {
    return this.request<ProjectResponse>("/projects", "POST", data, true);
  }

  async updateProject(
    id: string | number,
    data: Partial<ProjectCreateRequest>
  ): Promise<ApiResponse<ProjectResponse>> {
    return this.request<ProjectResponse>(`/projects/${id}`, "PUT", data, true);
  }

  async deleteProject(
    id: string | number
  ): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(`/projects/${id}`, "DELETE", {}, true);
  }

  // Machine API Methods
  async getMachines(): Promise<ApiResponse<MachinesListResponse>> {
    return this.request<MachinesListResponse>(
      "/machines",
      "GET",
      undefined,
      true
    );
  }

  async getMachine(id: string | number): Promise<ApiResponse<MachineResponse>> {
    return this.request<MachineResponse>(
      `/machines/${id}`,
      "GET",
      undefined,
      true
    );
  }

  async createMachine(
    data: MachineCreateRequest
  ): Promise<ApiResponse<MachineResponse>> {
    return this.request<MachineResponse>("/machines", "POST", data, true);
  }

  async updateMachine(
    id: string | number,
    data: Partial<MachineCreateRequest>
  ): Promise<ApiResponse<MachineResponse>> {
    return this.request<MachineResponse>(`/machines/${id}`, "PUT", data, true);
  }

  async deleteMachine(
    id: string | number
  ): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(`/machines/${id}`, "DELETE", {}, true);
  }

  async toggleMachineMaintenance(
    id: string | number
  ): Promise<ApiResponse<MachineResponse>> {
    return this.request<MachineResponse>(
      `/machines/${id}/toggle-maintenance`,
      "PATCH",
      {},
      true
    );
  }

  async getMachinesByType(
    type: string
  ): Promise<ApiResponse<MachinesListResponse>> {
    return this.request<MachinesListResponse>(
      `/machines/type/${type}`,
      "GET",
      undefined,
      true
    );
  }

  async getMachinesByStatus(
    status: string
  ): Promise<ApiResponse<MachinesListResponse>> {
    return this.request<MachinesListResponse>(
      `/machines/status/${status}`,
      "GET",
      undefined,
      true
    );
  }

  // Material API Methods
  async getMaterials(
    page: number = 1,
    perPage: number = 10,
    search?: string,
    category?: string,
    lowStock?: boolean
  ): Promise<ApiResponse<MaterialsListResponse>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (lowStock !== undefined) params.append("low_stock", lowStock.toString());

    return this.request<MaterialsListResponse>(
      `/materials?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getMaterial(
    id: string | number
  ): Promise<ApiResponse<MaterialResponse>> {
    return this.request<MaterialResponse>(
      `/materials/${id}`,
      "GET",
      undefined,
      true
    );
  }

  async createMaterial(
    data: MaterialCreateRequest
  ): Promise<ApiResponse<MaterialResponse>> {
    return this.request<MaterialResponse>("/materials", "POST", data, true);
  }

  async updateMaterial(
    id: string | number,
    data: Partial<MaterialCreateRequest>
  ): Promise<ApiResponse<MaterialResponse>> {
    return this.request<MaterialResponse>(
      `/materials/${id}`,
      "PUT",
      data,
      true
    );
  }

  async deleteMaterial(
    id: string | number
  ): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(`/materials/${id}`, "DELETE", {}, true);
  }

  async updateMaterialStock(
    id: string | number,
    stockChange: number,
    operation: "add" | "reduce"
  ): Promise<ApiResponse<MaterialResponse>> {
    return this.request<MaterialResponse>(
      `/materials/${id}/stock`,
      "PATCH",
      { stock_change: stockChange, operation },
      true
    );
  }

  async getLowStockMaterials(): Promise<ApiResponse<{ data: MaterialData[] }>> {
    return this.request<{ data: MaterialData[] }>(
      "/materials-low-stock",
      "GET",
      undefined,
      true
    );
  }

  // Project Items API Methods
  async getProjectItems(
    page: number = 1,
    perPage: number = 15,
    projectId?: string | number
  ): Promise<ApiResponse<ProjectItemsListResponse>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (projectId) params.append("project_id", projectId.toString());

    return this.request<ProjectItemsListResponse>(
      `/project-items?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getProjectItemsByProjectId(
    projectId: string | number
  ): Promise<ApiResponse<{ data: ProjectItemData[] }>> {
    return this.request<{ data: ProjectItemData[] }>(
      `/project-items/project/${projectId}`,
      "GET",
      undefined,
      true
    );
  }

  async getProjectItem(
    id: string | number
  ): Promise<ApiResponse<ProjectItemResponse>> {
    return this.request<ProjectItemResponse>(
      `/project-items/${id}`,
      "GET",
      undefined,
      true
    );
  }

  async createProjectItem(
    data: ProjectItemCreateRequest
  ): Promise<ApiResponse<ProjectItemResponse>> {
    return this.request<ProjectItemResponse>(
      "/project-items",
      "POST",
      data,
      true
    );
  }

  async updateProjectItem(
    id: string | number,
    data: Partial<ProjectItemCreateRequest>
  ): Promise<ApiResponse<ProjectItemResponse>> {
    return this.request<ProjectItemResponse>(
      `/project-items/${id}`,
      "PUT",
      data,
      true
    );
  }

  async deleteProjectItem(
    id: string | number
  ): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(
      `/project-items/${id}`,
      "DELETE",
      {},
      true
    );
  }

  // BOM Items API Methods
  async getBomItems(
    page: number = 1,
    perPage: number = 50
  ): Promise<ApiResponse<BomItemsListResponse>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    return this.request<BomItemsListResponse>(
      `/bom-items?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getBomItem(id: string | number): Promise<ApiResponse<BomItemResponse>> {
    return this.request<BomItemResponse>(
      `/bom-items/${id}`,
      "GET",
      undefined,
      true
    );
  }

  async getBomItemsByProjectItem(
    projectItemId: string | number
  ): Promise<ApiResponse<BomItemsListResponse>> {
    return this.request<BomItemsListResponse>(
      `/bom-items-by-project-item/${projectItemId}`,
      "GET",
      undefined,
      true
    );
  }

  async createBomItem(
    data: BomItemCreateRequest
  ): Promise<ApiResponse<BomItemResponse>> {
    return this.request<BomItemResponse>("/bom-items", "POST", data, true);
  }

  async updateBomItem(
    id: string | number,
    data: Partial<BomItemCreateRequest>
  ): Promise<ApiResponse<BomItemResponse>> {
    return this.request<BomItemResponse>(
      `/bom-items/${id}`,
      "PATCH",
      data,
      true
    );
  }

  async deleteBomItem(
    id: string | number
  ): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(`/bom-items/${id}`, "DELETE", {}, true);
  }

  // Task API Methods
  async getTasks(
    page: number = 1,
    perPage: number = 50,
    filters?: {
      status?: string;
      project_id?: string | number;
      item_id?: string | number;
      machine_id?: string | number;
    }
  ): Promise<ApiResponse<TasksListResponse>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.project_id)
      params.append("project_id", filters.project_id.toString());
    if (filters?.item_id) params.append("item_id", filters.item_id.toString());
    if (filters?.machine_id)
      params.append("machine_id", filters.machine_id.toString());
    return this.request<TasksListResponse>(
      `/tasks?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getTask(id: string | number): Promise<ApiResponse<TaskResponse>> {
    return this.request<TaskResponse>(`/tasks/${id}`, "GET", undefined, true);
  }

  async createTask(
    data: TaskCreateRequest
  ): Promise<ApiResponse<TaskResponse>> {
    return this.request<TaskResponse>("/tasks", "POST", data, true);
  }

  async updateTask(
    id: string | number,
    data: Partial<TaskCreateRequest>
  ): Promise<ApiResponse<TaskResponse>> {
    return this.request<TaskResponse>(`/tasks/${id}`, "PUT", data, true);
  }

  async deleteTask(id: string | number): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(`/tasks/${id}`, "DELETE", {}, true);
  }

  async updateTaskStatus(
    id: string | number,
    status: string
  ): Promise<ApiResponse<TaskResponse>> {
    return this.request<TaskResponse>(
      `/tasks/${id}/status`,
      "PATCH",
      { status },
      true
    );
  }

  async updateTaskQuantities(
    id: string | number,
    completed_qty: number,
    defect_qty: number
  ): Promise<ApiResponse<TaskResponse>> {
    return this.request<TaskResponse>(
      `/tasks/${id}/quantities`,
      "PATCH",
      { completed_qty, defect_qty },
      true
    );
  }

  async startTaskDowntime(
    id: string | number
  ): Promise<ApiResponse<TaskResponse>> {
    return this.request<TaskResponse>(
      `/tasks/${id}/start-downtime`,
      "POST",
      {},
      true
    );
  }

  async endTaskDowntime(
    id: string | number
  ): Promise<ApiResponse<TaskResponse>> {
    return this.request<TaskResponse>(
      `/tasks/${id}/end-downtime`,
      "POST",
      {},
      true
    );
  }

  async getTaskStatistics(): Promise<
    ApiResponse<{
      total: number;
      pending: number;
      in_progress: number;
      paused: number;
      downtime: number;
      completed: number;
    }>
  > {
    return this.request<{
      total: number;
      pending: number;
      in_progress: number;
      paused: number;
      downtime: number;
      completed: number;
    }>("/tasks-statistics", "GET", undefined, true);
  }

  // Production Logs API Methods
  async getProductionLogs(
    page: number = 1,
    perPage: number = 50,
    filters?: {
      project_id?: string | number;
      machine_id?: string | number;
      task_id?: string | number;
      shift?: string;
      type?: string;
      from_date?: string;
      to_date?: string;
      date?: string;
    }
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (filters?.project_id)
      params.append("project_id", filters.project_id.toString());
    if (filters?.machine_id)
      params.append("machine_id", filters.machine_id.toString());
    if (filters?.task_id) params.append("task_id", filters.task_id.toString());
    if (filters?.shift) params.append("shift", filters.shift);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.from_date) params.append("from_date", filters.from_date);
    if (filters?.to_date) params.append("to_date", filters.to_date);
    if (filters?.date) params.append("date", filters.date);
    return this.request<any>(
      `/production-logs?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getProductionLogsByMachine(
    machineId: string | number,
    page: number = 1,
    perPage: number = 50,
    filters?: { type?: string; shift?: string }
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.shift) params.append("shift", filters.shift);
    return this.request<any>(
      `/production-logs/machine/${machineId}?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getProductionLogsByProject(
    projectId: string | number,
    page: number = 1,
    perPage: number = 50,
    filters?: { type?: string; shift?: string }
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.shift) params.append("shift", filters.shift);
    return this.request<any>(
      `/production-logs/project/${projectId}?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  async getProductionLog(id: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/production-logs/${id}`, "GET", undefined, true);
  }

  async createProductionLog(data: {
    task_id: string | number;
    machine_id: string | number;
    item_id: string | number;
    project_id: string | number;
    step: string;
    shift: string;
    good_qty: number;
    defect_qty: number;
    operator: string;
    logged_at: string;
    type: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>("/production-logs", "POST", data, true);
  }

  async updateProductionLog(
    id: string | number,
    data: Partial<{
      task_id: string | number;
      machine_id: string | number;
      item_id: string | number;
      project_id: string | number;
      step: string;
      shift: string;
      good_qty: number;
      defect_qty: number;
      operator: string;
      logged_at: string;
      type: string;
    }>
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/production-logs/${id}`, "PUT", data, true);
  }

  async deleteProductionLog(
    id: string | number
  ): Promise<ApiResponse<DeleteResponse>> {
    return this.request<DeleteResponse>(
      `/production-logs/${id}`,
      "DELETE",
      {},
      true
    );
  }

  async getProductionSummary(filters?: {
    project_id?: string | number;
    machine_id?: string | number;
    from_date?: string;
    to_date?: string;
  }): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters?.project_id)
      params.append("project_id", filters.project_id.toString());
    if (filters?.machine_id)
      params.append("machine_id", filters.machine_id.toString());
    if (filters?.from_date) params.append("from_date", filters.from_date);
    if (filters?.to_date) params.append("to_date", filters.to_date);
    return this.request<any>(
      `/production-summary?${params.toString()}`,
      "GET",
      undefined,
      true
    );
  }

  // Backup API Methods
  async getBackups(): Promise<ApiResponse<any>> {
    return this.request<any>("/backups", "GET", undefined, true);
  }

  async getBackup(id: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/backups/${id}`, "GET", undefined, true);
  }

  async createBackup(
    type: "full" | "incremental" | "selective" = "full"
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/backups", "POST", { type }, true);
  }

  async updateBackup(
    id: string | number,
    data: {
      status?: "pending" | "processing" | "completed" | "failed";
      size?: number;
      completed_at?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/backups/${id}`, "PATCH", data, true);
  }

  async deleteBackup(id: string | number): Promise<ApiResponse<any>> {
    return this.request<any>(`/backups/${id}`, "DELETE", {}, true);
  }

  async downloadBackup(id: string | number): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${this.baseUrl}/backups/${id}/download`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("Authorization", `Bearer ${token}`);
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async getBackupStats(): Promise<ApiResponse<any>> {
    return this.request<any>("/backups/stats", "GET", undefined, true);
  }

  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  clearToken(): void {
    localStorage.removeItem("auth_token");
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const apiClient = new ApiClient();
export type {
  LoginResponse,
  UserProfileResponse,
  UserData,
  UsersListResponse,
  UserResponse,
  UserCreateRequest,
  UserUpdateRequest,
  ApiResponse,
  ProjectData,
  ProjectsListResponse,
  ProjectResponse,
  ProjectCreateRequest,
  MachineData,
  MachinesListResponse,
  MachineResponse,
  MachineCreateRequest,
  MachinePersonnelData,
  DeleteResponse,
  MaterialData,
  MaterialsListResponse,
  MaterialResponse,
  MaterialCreateRequest,
  StockAdjustmentRequest,
  ProjectItemData,
  ProjectItemsListResponse,
  ProjectItemResponse,
  ProjectItemCreateRequest,
  BomItemData,
  BomItemsListResponse,
  BomItemResponse,
  BomItemCreateRequest,
  TaskData,
  TasksListResponse,
  TaskResponse,
  TaskCreateRequest,
  TaskStatusRequest,
  TaskQuantitiesRequest,
  BackupData,
  BackupsListResponse,
  BackupStatsResponse,
};

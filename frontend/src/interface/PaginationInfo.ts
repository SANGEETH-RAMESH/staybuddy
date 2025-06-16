export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalHosts?: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalUsers?:number
}
/**
 * Pagination metadata
 */
export interface Pagination {
  /**
   * Current page number (1-indexed)
   */
  page: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Total number of pages available
   */
  totalPages: number;

  /**
   * Total number of items across all pages
   */
  totalItems: number;
}

/**
 * Generic paginated response wrapper
 * @template TData - The type of data items in the paginated result
 */
export interface Paginated<TData> {
  /**
   * Array of data items for the current page
   */
  data: TData[];

  /**
   * Pagination metadata
   */
  pagination: Pagination;
}

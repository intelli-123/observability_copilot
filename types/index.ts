export interface ToolStatus {
  name: string;
  envVar: string;
  isActive: boolean;
}

export interface LogQuery {
  tool: string;
  query: string;
}

export interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
  suggestion?: string;
}

export interface Runbook {
  title: string;
  steps: string[];
}

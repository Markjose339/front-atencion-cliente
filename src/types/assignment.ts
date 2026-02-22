export interface AssignmentBranchRef {
  id: string;
  name: string;
}

export interface AssignmentWindowRef {
  id: string;
  name: string;
  code: string;
}

export interface AssignmentServiceRef {
  id: string;
  name: string;
  abbreviation: string;
  code: string;
}

export interface AssignmentUserRef {
  id: string;
  name: string;
  email: string;
}

export interface WindowServiceAssignment {
  id: string;
  isActive: boolean;
  branch: AssignmentBranchRef;
  window: AssignmentWindowRef;
  service: AssignmentServiceRef;
}

export interface WindowServiceAssignmentBulkResult {
  id: string;
  isActive: boolean;
  service: AssignmentServiceRef;
}

export interface WindowServiceAssignmentBulkSummary {
  requested: number;
  assigned: number;
  alreadyAssigned: number;
}

export interface WindowServiceAssignmentBulkResponse {
  branchId: string;
  windowId: string;
  assigned: WindowServiceAssignmentBulkResult[];
  alreadyAssigned: WindowServiceAssignmentBulkResult[];
  summary: WindowServiceAssignmentBulkSummary;
}

export interface BranchWindowOption {
  branchWindowId: string;
  window: AssignmentWindowRef;
}

export interface BranchWindowsResponse {
  branchId: string;
  data: BranchWindowOption[];
}

export interface OperatorAssignment {
  id: string;
  isActive: boolean;
  branch: AssignmentBranchRef;
  window: AssignmentWindowRef;
  user: AssignmentUserRef;
}

export interface AssignmentConfigOperatorUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface AssignmentConfigOperatorCatalogUser {
  id: string;
  name: string;
  email: string;
}

export interface AssignmentConfigWindow {
  branchWindowId: string | null;
  window: AssignmentWindowRef;
  serviceIds: string[];
}

export interface AssignmentConfigOperatorAssignment {
  id: string;
  isActive: boolean;
  user: AssignmentConfigOperatorUser;
  window: AssignmentWindowRef;
}

export interface BranchAssignmentsConfigResponse {
  branch: AssignmentBranchRef;
  services: AssignmentServiceRef[];
  windows: AssignmentConfigWindow[];
  operatorAssignments: AssignmentConfigOperatorAssignment[];
  operatorsCatalog: AssignmentConfigOperatorCatalogUser[];
}

export interface WindowServicesSyncPayload {
  branchId: string;
  windowServices: Array<{
    windowId: string;
    serviceIds: string[];
  }>;
}

export interface WindowServicesSyncSummary {
  requested: number;
  created: number;
  activated: number;
  deleted: number;
  unchanged: number;
}

export interface WindowServicesSyncResponse {
  branchId: string;
  summary: WindowServicesSyncSummary;
}

export interface OperatorsSyncPayload {
  branchId: string;
  assignments: Array<{
    userId: string;
    windowId: string;
    isActive: boolean;
  }>;
}

export interface OperatorsSyncSummary {
  requested: number;
  created: number;
  updated: number;
  deleted: number;
  unchanged: number;
}

export interface OperatorsSyncResponse {
  branchId: string;
  summary: OperatorsSyncSummary;
}

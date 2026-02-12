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

export interface OperatorAssignment {
  id: string;
  isActive: boolean;
  branch: AssignmentBranchRef;
  window: AssignmentWindowRef;
  user: AssignmentUserRef;
}

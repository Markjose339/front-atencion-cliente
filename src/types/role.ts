export interface Role {
  id: string;
  name: string;
  createdAt: Date;
  permissions: {
    id: string;
    name: string;
  }[]
}
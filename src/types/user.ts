export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  serviceWindow: {
    id: string;
    name: string;
  };
  roles: {
    id: string;
    name: string;
  }[]
}
export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  roles: {
    id: string;
    name: string;
  }[]
}
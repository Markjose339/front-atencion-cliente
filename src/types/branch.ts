export interface Branch {
  id: string;
  name: string;
  address: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: string;
};

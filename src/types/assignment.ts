export interface Assignment {
  id: string;
  branch: {
    id: string;
    name: string;
  };
  window: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    abbreviation: string;
    code: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

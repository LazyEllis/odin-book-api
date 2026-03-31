export interface UserCreate {
  name: string;
  username: string;
  password: string;
}

export interface UserUpdate {
  name: string;
  username: string;
  description: string | null;
  location: string | null;
  url: string | null;
}

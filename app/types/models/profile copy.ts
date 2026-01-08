export interface Profile {
  id: string;
  name?: string | null;
  isPublic: boolean;

  userId: string;

  createdAt: string;
  updatedAt: string;
}

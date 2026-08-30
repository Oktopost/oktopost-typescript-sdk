export interface Folder {
  Id: string;
  Name: string;
  FolderId: string | null;
  Created: string;
}

export interface FolderListParams {
  folderId?: string;
  q?: string;
  _page?: number;
  _count?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface CreateFolderParams {
  name: string;
  folderId?: string;
}

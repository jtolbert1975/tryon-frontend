export interface AccessoryItem {
    id: number;
    file: File | null;
    preview: string | null;
    type: string;
    processing: boolean;
  }
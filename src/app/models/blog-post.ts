export interface BlogSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string; // meta description + index excerpt
  date: string; // ISO yyyy-mm-dd
  readMinutes: number;
  sections: BlogSection[];
}

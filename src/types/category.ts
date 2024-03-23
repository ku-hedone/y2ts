import type { Api } from "./api";

export interface Project {
  _id: number;
  name: string;
  desc?: string;
  tag: string[];
  env: {
    name: string;
    domain: string;
  }[];
}
export interface Category {
  _id: number;
  name: string;
  desc?: string;
  list: Api[];
  // add_time: number;
  // up_time: number;
}

export type CategoryList = (Category & {
  list: Omit<
    Api,
    '_id' | 'title' | 'status' | 'path' | 'method' | 'tag'
  >[];
})[];

// export interface FullCategory extends Category {
//   project_id: number;
//   project_name: string;
//   token: string;
//   host: string;
//   base: string;
// };


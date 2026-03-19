export interface AdminConfig {
  owner: string;
  repo: string;
  branch: string;
  activitiesPath: string;
}

export interface GitHubFile {
  sha: string;
  content: string;
  encoding: "base64";
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

export type DateType = "single" | "range" | "list";

export interface ActivityFormData {
  title: string;
  dateType: DateType;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  dates?: string[];
  timeStart?: string;
  timeEnd?: string;
  description: string;
  url?: string;
}

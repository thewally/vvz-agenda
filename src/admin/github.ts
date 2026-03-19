import { AdminConfig, GitHubUser } from "./types.js";

const CONFIG: AdminConfig = {
  owner: "thewally",
  repo: "vvz-agenda",
  branch: "main",
  activitiesPath: "public/activities",
};

const API_BASE = "https://api.github.com";

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function encodeContent(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function getConfig(): AdminConfig {
  return CONFIG;
}

export async function verifyAccess(token: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/repos/${CONFIG.owner}/${CONFIG.repo}`, {
    headers: headers(token),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.permissions?.push === true;
}

export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${API_BASE}/user`, {
    headers: headers(token),
  });
  if (!res.ok) {
    throw new Error(`Kan gebruiker niet ophalen: ${res.status}`);
  }
  return res.json() as Promise<GitHubUser>;
}

export async function getFile(
  token: string,
  path: string
): Promise<{ sha: string; content: string }> {
  const res = await fetch(
    `${API_BASE}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`,
    { headers: headers(token) }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  const data = await res.json();
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
  return { sha: data.sha, content };
}

export async function getFileSha(token: string, path: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`,
    { headers: headers(token) }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch sha for ${path}: ${res.status}`);
  }
  const data = await res.json();
  return (data as { sha: string }).sha;
}

export async function deleteFile(
  token: string,
  path: string,
  sha: string,
  message: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: "DELETE",
      headers: headers(token),
      body: JSON.stringify({ message, sha, branch: CONFIG.branch }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to delete ${path}: ${res.status} ${(err as Record<string, string>).message ?? ""}`
    );
  }
}

export async function createOrUpdateFile(
  token: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  const body: Record<string, string> = {
    message,
    content: encodeContent(content),
    branch: CONFIG.branch,
  };
  if (sha) {
    body.sha = sha;
  }
  const res = await fetch(
    `${API_BASE}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to write ${path}: ${res.status} ${(err as Record<string, string>).message ?? ""}`
    );
  }
}

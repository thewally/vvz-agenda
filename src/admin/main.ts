import { createLoginForm } from "./components/LoginForm.js";
import { createActivityForm } from "./components/ActivityForm.js";
import { createStatusBanner } from "./components/StatusBanner.js";
import { getAuthenticatedUser } from "./github.js";
import { GitHubUser } from "./types.js";

const TOKEN_KEY = "vvz_admin_token";

function renderApp(): void {
  const root = document.getElementById("admin-root");
  if (!root) return;

  root.textContent = "";

  const existingToken = sessionStorage.getItem(TOKEN_KEY);

  if (existingToken) {
    renderLoading(root, existingToken);
  } else {
    renderLogin(root);
  }
}

function renderLogin(root: HTMLElement): void {
  const loginForm = createLoginForm((token, user) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    root.textContent = "";
    renderForm(root, token, user);
  });
  root.append(loginForm);
}

function renderLoading(root: HTMLElement, token: string): void {
  const p = document.createElement("p");
  p.textContent = "Laden...";
  root.append(p);

  void getAuthenticatedUser(token)
    .then((user) => {
      root.textContent = "";
      renderForm(root, token, user);
    })
    .catch(() => {
      sessionStorage.removeItem(TOKEN_KEY);
      root.textContent = "";
      renderLogin(root);
    });
}

function renderForm(root: HTMLElement, token: string, user: GitHubUser): void {
  const userHeader = document.createElement("div");
  userHeader.className = "user-header";

  const avatar = document.createElement("img");
  avatar.src = user.avatar_url;
  avatar.alt = user.login;
  avatar.width = 28;
  avatar.height = 28;
  avatar.className = "user-avatar";

  const userName = document.createElement("span");
  userName.className = "user-name";
  userName.textContent = `Ingelogd als ${user.login}`;

  const logoutBtn = document.createElement("button");
  logoutBtn.type = "button";
  logoutBtn.className = "logout-btn";
  logoutBtn.textContent = "Uitloggen";
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(TOKEN_KEY);
    renderApp();
  });

  userHeader.append(avatar, userName, logoutBtn);

  const banner = createStatusBanner();
  const form = createActivityForm(token, banner);

  root.append(userHeader, banner.element, form);
}

renderApp();

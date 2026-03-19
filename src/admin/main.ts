import { createLoginForm } from "./components/LoginForm.js";
import { createActivityForm } from "./components/ActivityForm.js";
import { createActivityList } from "./components/ActivityList.js";
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
    renderMain(root, token, user);
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
      renderMain(root, token, user);
    })
    .catch(() => {
      sessionStorage.removeItem(TOKEN_KEY);
      root.textContent = "";
      renderLogin(root);
    });
}

function renderMain(root: HTMLElement, token: string, user: GitHubUser): void {
  // User header
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

  // Tab bar
  const tabBar = document.createElement("div");
  tabBar.className = "tab-bar";

  const tabAdd = document.createElement("button");
  tabAdd.type = "button";
  tabAdd.className = "tab-btn tab-active";
  tabAdd.textContent = "Activiteit toevoegen";

  const tabManage = document.createElement("button");
  tabManage.type = "button";
  tabManage.className = "tab-btn";
  tabManage.textContent = "Activiteiten beheren";

  tabBar.append(tabAdd, tabManage);

  // Status banner (shared)
  const banner = createStatusBanner();

  // Tab content area
  const tabContent = document.createElement("div");
  tabContent.className = "tab-content";

  // Build both panels
  const formPanel = createActivityForm(token, banner);
  const listPanel = createActivityList(token, banner);
  listPanel.style.display = "none";

  tabContent.append(formPanel, listPanel);

  // Tab switching
  tabAdd.addEventListener("click", () => {
    tabAdd.className = "tab-btn tab-active";
    tabManage.className = "tab-btn";
    formPanel.style.display = "";
    listPanel.style.display = "none";
    banner.hide();
  });

  tabManage.addEventListener("click", () => {
    tabManage.className = "tab-btn tab-active";
    tabAdd.className = "tab-btn";
    listPanel.style.display = "";
    formPanel.style.display = "none";
    banner.hide();
  });

  root.append(userHeader, tabBar, banner.element, tabContent);
}

renderApp();

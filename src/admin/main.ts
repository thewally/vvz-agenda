import { createLoginForm } from "./components/LoginForm.js";
import { createActivityForm } from "./components/ActivityForm.js";
import { createActivityList } from "./components/ActivityList.js";
import { createStatusBanner } from "./components/StatusBanner.js";
import { getSession, signOut } from "./supabase.js";
import type { SupabaseUser } from "./types.js";

function renderApp(): void {
  const root = document.getElementById("admin-root");
  if (!root) return;

  root.textContent = "";

  void getSession().then((user) => {
    if (user) {
      renderMain(root, user);
    } else {
      renderLogin(root);
    }
  }).catch(() => {
    renderLogin(root);
  });
}

function renderLogin(root: HTMLElement): void {
  const loginForm = createLoginForm((user) => {
    root.textContent = "";
    renderMain(root, user);
  });
  root.append(loginForm);
}

function renderMain(root: HTMLElement, user: SupabaseUser): void {
  // User header
  const userHeader = document.createElement("div");
  userHeader.className = "user-header";

  const userName = document.createElement("span");
  userName.className = "user-name";
  userName.textContent = `Ingelogd als ${user.email ?? "onbekend"}`;

  const logoutBtn = document.createElement("button");
  logoutBtn.type = "button";
  logoutBtn.className = "logout-btn";
  logoutBtn.textContent = "Uitloggen";
  logoutBtn.addEventListener("click", () => {
    void signOut().then(() => renderApp());
  });

  userHeader.append(userName, logoutBtn);

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
  const formPanel = createActivityForm(banner);
  const listPanel = createActivityList(banner);
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

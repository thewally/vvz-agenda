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

  const tabList = document.createElement("button");
  tabList.type = "button";
  tabList.className = "tab-btn tab-active";
  tabList.textContent = "Activiteiten";

  const tabAdd = document.createElement("button");
  tabAdd.type = "button";
  tabAdd.className = "tab-btn";
  tabAdd.textContent = "Nieuwe activiteit";

  tabBar.append(tabList, tabAdd);

  // Status banner (shared)
  const banner = createStatusBanner();

  // Tab content area
  const tabContent = document.createElement("div");
  tabContent.className = "tab-content";

  // "Nieuwe activiteit" form (always-empty add form)
  const addForm = createActivityForm(banner, () => {
    // After save, reload list and switch to list tab
    activityList.reload();
    tabList.click();
  });
  const addPanel = addForm.element;
  addPanel.style.display = "none";

  // Edit form (inline, shown above the list)
  const editForm = createActivityForm(banner, () => {
    // After save, hide edit form, show list, reload
    editPanel.style.display = "none";
    listPanel.style.display = "";
    activityList.reload();
  }, () => {
    // onCancel: hide edit form, show list
    editPanel.style.display = "none";
    listPanel.style.display = "";
  });
  const editPanel = editForm.element;
  editPanel.style.display = "none";

  // Activity list
  const activityList = createActivityList(banner, (rows) => {
    // Show edit form inline (hide list, show edit form above)
    editForm.loadActivity(rows);
    listPanel.style.display = "none";
    editPanel.style.display = "";
    banner.hide();
  });
  const listPanel = activityList.element;

  // List tab contains: edit form + list (edit form hidden by default)
  const listTabContainer = document.createElement("div");
  listTabContainer.append(editPanel, listPanel);

  tabContent.append(listTabContainer, addPanel);

  // Tab switching
  tabList.addEventListener("click", () => {
    tabList.className = "tab-btn tab-active";
    tabAdd.className = "tab-btn";
    listTabContainer.style.display = "";
    addPanel.style.display = "none";
    banner.hide();
  });

  tabAdd.addEventListener("click", () => {
    tabAdd.className = "tab-btn tab-active";
    tabList.className = "tab-btn";
    addPanel.style.display = "";
    listTabContainer.style.display = "none";
    banner.hide();
  });

  root.append(userHeader, tabBar, banner.element, tabContent);
}

renderApp();

import { verifyAccess, getAuthenticatedUser } from "../github.js";
import { GitHubUser } from "../types.js";

export function createLoginForm(
  onSuccess: (token: string, user: GitHubUser) => void
): HTMLElement {
  const container = document.createElement("div");
  container.className = "login-card";

  const heading = document.createElement("h2");
  heading.textContent = "Inloggen";

  const field = document.createElement("div");
  field.className = "form-field";

  const label = document.createElement("label");
  label.textContent = "Toegangstoken";
  label.htmlFor = "pat-input";

  const input = document.createElement("input");
  input.type = "password";
  input.id = "pat-input";
  input.placeholder = "ghp_...";
  input.autocomplete = "off";

  const helper = document.createElement("p");
  helper.className = "login-helper";
  helper.innerHTML =
    'Nog geen token? <a href="https://github.com/settings/tokens/new?scopes=repo&description=VVZ+Agenda+Beheer" target="_blank" rel="noopener noreferrer">Maak een token aan op GitHub</a>';

  const errorMsg = document.createElement("p");
  errorMsg.className = "login-error";
  errorMsg.style.display = "none";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Inloggen";
  button.className = "login-btn";

  field.append(label, input, helper, errorMsg);
  container.append(heading, field, button);

  async function handleSubmit(): Promise<void> {
    const token = input.value.trim();
    if (!token) {
      showError("Vul een token in.");
      return;
    }

    button.disabled = true;
    button.textContent = "Inloggen...";
    errorMsg.style.display = "none";

    try {
      const hasAccess = await verifyAccess(token);
      if (!hasAccess) {
        showError("Je hebt geen schrijfrechten op deze repository.");
        return;
      }

      const user = await getAuthenticatedUser(token);
      onSuccess(token, user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Onbekende fout.";
      showError(message);
    } finally {
      button.disabled = false;
      button.textContent = "Inloggen";
    }
  }

  function showError(msg: string): void {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  button.addEventListener("click", () => {
    void handleSubmit();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      void handleSubmit();
    }
  });

  return container;
}

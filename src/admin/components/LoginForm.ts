import { signIn } from "../supabase.js";
import type { SupabaseUser } from "../types.js";

export function createLoginForm(
  onSuccess: (user: SupabaseUser) => void
): HTMLElement {
  const container = document.createElement("div");
  container.className = "login-card";

  const heading = document.createElement("h2");
  heading.textContent = "Inloggen";

  const emailField = document.createElement("div");
  emailField.className = "form-field";

  const emailLabel = document.createElement("label");
  emailLabel.textContent = "E-mailadres";
  emailLabel.htmlFor = "email-input";

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "email-input";
  emailInput.placeholder = "naam@voorbeeld.nl";
  emailInput.autocomplete = "email";

  emailField.append(emailLabel, emailInput);

  const passField = document.createElement("div");
  passField.className = "form-field";

  const passLabel = document.createElement("label");
  passLabel.textContent = "Wachtwoord";
  passLabel.htmlFor = "password-input";

  const passInput = document.createElement("input");
  passInput.type = "password";
  passInput.id = "password-input";
  passInput.autocomplete = "current-password";

  passField.append(passLabel, passInput);

  const errorMsg = document.createElement("p");
  errorMsg.className = "login-error";
  errorMsg.style.display = "none";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Inloggen";
  button.className = "login-btn";

  container.append(heading, emailField, passField, errorMsg, button);

  async function handleSubmit(): Promise<void> {
    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) {
      showError("Vul e-mailadres en wachtwoord in.");
      return;
    }

    button.disabled = true;
    button.textContent = "Inloggen...";
    errorMsg.style.display = "none";

    try {
      const user = await signIn(email, password);
      onSuccess(user);
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

  passInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      void handleSubmit();
    }
  });

  return container;
}

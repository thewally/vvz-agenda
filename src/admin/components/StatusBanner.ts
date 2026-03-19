export interface StatusBanner {
  element: HTMLElement;
  show(type: "success" | "error", message: string): void;
  hide(): void;
}

export function createStatusBanner(): StatusBanner {
  const el = document.createElement("div");
  el.className = "status-banner";
  el.style.display = "none";

  return {
    element: el,
    show(type: "success" | "error", message: string) {
      el.textContent = message;
      el.className = `status-banner status-${type}`;
      el.style.display = "block";
    },
    hide() {
      el.style.display = "none";
    },
  };
}

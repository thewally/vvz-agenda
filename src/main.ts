import { initWidget } from "./widget";
import type { VvzAgendaConfig } from "./types";

window.VvzAgenda = {
  init: (config: VvzAgendaConfig) => initWidget(config),
};

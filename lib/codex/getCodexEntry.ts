import { codexRegistry } from "./codexRegistry";
export { getCodexEntriesByType, resolveCodexEntry, searchCodexEntries } from "./resolveCodexEntry";

export function getCodexEntry(id: string) {
  return codexRegistry.find((entry) => entry.id === id);
}

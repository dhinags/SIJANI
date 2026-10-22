"use client";
import { createContext, useContext, useEffect, useId, useState } from "react";

type WorkingCopy = { value: unknown; dirty: boolean };
function createStore() {
  return { blockers: new Set<string>(), drafts: new Map<string, WorkingCopy>() };
}
const GuardContext = createContext<ReturnType<typeof createStore> | null>(null);
export function NavigationGuard({ children }: { children: React.ReactNode }) {
  const [store] = useState(createStore);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (store.blockers.size) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [store]);
  return <GuardContext.Provider value={store}>{children}</GuardContext.Provider>;
}
export function useConfirmNavigation() {
  const store = useContext(GuardContext);
  return () => !store?.blockers.size || window.confirm("Ada perubahan yang belum disimpan. Tinggalkan halaman? Pilih Batal untuk kembali menyimpan pekerjaan Anda.");
}
export function useUnsavedChanges(dirty: boolean) {
  const store = useContext(GuardContext); const id = useId();
  useEffect(() => {
    if (dirty) store?.blockers.add(id); else store?.blockers.delete(id);
    return () => { store?.blockers.delete(id); };
  }, [dirty, id, store]);
}
// Memory only: browser history can restore work in this tab without putting learner text in storage.
export function useWorkingCopy<T>(key: string, initial: T, restore = true) {
  const store = useContext(GuardContext);
  const [copy, setCopy] = useState<WorkingCopy>(() => (restore ? store?.drafts.get(key) : undefined) ?? { value: initial, dirty: false });
  useUnsavedChanges(copy.dirty);
  function update(value: T) {
    const next = { value, dirty: true }; store?.drafts.set(key, next); setCopy(next);
  }
  function commit(value: T) {
    store?.drafts.delete(key); setCopy({ value, dirty: false });
  }
  return { value: copy.value as T, dirty: copy.dirty, update, commit };
}
export function useClearWorkingCopies() {
  const store = useContext(GuardContext);
  return () => { store?.drafts.clear(); store?.blockers.clear(); };
}

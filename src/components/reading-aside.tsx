"use client";
import { useSyncExternalStore, type ReactNode } from "react";
const query="(max-width: 760px)";
function subscribe(callback:()=>void){const media=window.matchMedia(query);media.addEventListener("change",callback);return()=>media.removeEventListener("change",callback);}
export function ReadingAside({children}:{children:ReactNode}) {const compact=useSyncExternalStore(subscribe,()=>window.matchMedia(query).matches,()=>false);return compact?<details className="reading-index-disclosure"><summary>Daftar isi & hubungan materi</summary>{children}</details>:children;}

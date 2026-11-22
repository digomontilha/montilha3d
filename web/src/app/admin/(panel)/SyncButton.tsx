"use client";

import { useFormStatus } from "react-dom";

// Precisa ficar dentro do <form>: useFormStatus lê o envio do form pai.
export function SyncButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <button disabled={pending} className="btn disabled:opacity-50">
        {pending ? "Sincronizando..." : "Sincronizar Nuvemshop"}
      </button>
      {pending && (
        <div role="progressbar" aria-label="Sincronizando com a Nuvemshop" className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-line">
          <div className="h-full w-1/3 animate-[sync-bar_1.1s_ease-in-out_infinite] bg-brand" />
        </div>
      )}
    </>
  );
}

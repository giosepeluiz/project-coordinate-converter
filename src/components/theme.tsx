"use client";

import { useSyncExternalStore } from "react";
import type { SVGProps } from "react";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "@/lib/theme-script";

export type ThemeChoice = "system" | "light" | "dark";

/** Usado quando o navegador bloqueia o localStorage. */
let memoryChoice: ThemeChoice = "system";

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    /* armazenamento bloqueado (ex.: navegação privada restrita) */
    return memoryChoice;
  }
}

function apply(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

const Svg = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  />
);

const OPTIONS: { value: ThemeChoice; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "Tema do sistema",
    icon: (
      <Svg>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </Svg>
    ),
  },
  {
    value: "light",
    label: "Tema claro",
    icon: (
      <Svg>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </Svg>
    ),
  },
  {
    value: "dark",
    label: "Tema escuro",
    icon: (
      <Svg>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </Svg>
    ),
  },
];

const LOCAL_EVENT = "themechange";

function subscribe(onChange: () => void) {
  // Outras abas abertas e a própria aba (evento local).
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    apply(readChoice());
    onChange();
  };
  // Troca de tema do sistema operacional (quando em "Sistema").
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => readChoice() === "system" && apply("system");

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCAL_EVENT, onChange);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCAL_EVENT, onChange);
    media.removeEventListener("change", onSystemChange);
  };
}

/** Salva no localStorage (sem prazo de expiração) e aplica o tema. */
function saveChoice(value: ThemeChoice) {
  memoryChoice = value;
  try {
    if (value === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* sem armazenamento: vale só enquanto a página estiver aberta */
  }
  apply(value);
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

export function ThemeToggle() {
  // null no servidor: nenhum botão marcado até ler o navegador (evita divergência na hidratação).
  const choice = useSyncExternalStore<ThemeChoice | null>(subscribe, readChoice, () => null);

  const select = saveChoice;

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="flex shrink-0 items-center gap-0.5 rounded-full bg-gray-100 p-0.5 ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
      {OPTIONS.map((o) => {
        const active = choice === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            onClick={() => select(o.value)}
            className={`flex size-7 items-center justify-center rounded-full transition-colors ${
              active
                ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-950 dark:text-emerald-400"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}>
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}

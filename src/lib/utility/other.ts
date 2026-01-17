// deno-lint-ignore-file no-explicit-any
import { type Writable } from "svelte/store";
import type { Result } from "$lib/types.ts";

export async function getCurrentWritableValue<T>(
  writable: Writable<T>,
): Promise<T | undefined> {
  return await new Promise<T | undefined>((
    resolve,
  ) =>
    writable.subscribe((value: T) => {
      resolve(value);
    })
  );
}

export function stringToUrl(url: string): Result<URL> {
  let success = true;
  let data: URL | null = null;
  try {
    data = new URL(url);
  } catch {
    success = false;
  }

  if (success) {
    return {
      success,
      data: data as URL,
    };
  }
  return {
    success,
    reason: "The Given URL is invalid",
  };
}

export function getDayOfYear(date: Date) {
  const firstDay = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - firstDay.getTime(); // ms
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

export function indexOfMax(arr: any[]) {
  return arr.indexOf(Math.max(...arr));
}
export function indexOfMin(arr: any[]) {
  let min = Infinity;
  let index = 0;
  arr.forEach((v, i) => {
    if (v != 0 && v < min) {
      min = v;
      index = i;
    }
  });
  return index;
}

export function showPlaying(itemQuery: any, itemId: any, idRange: number) {
  for (let i = 0; i < idRange; i++) {
    const itemOverlay = document.querySelector(`${itemQuery}-${i}`);
    if (itemOverlay) {
      itemOverlay.innerHTML = ``;
      itemOverlay.classList.add(`hidden`);
    }
  }

  const playingItemOverlay = document.querySelector(`${itemQuery}-${itemId}`);

  // animated bars
  if (playingItemOverlay) {
    playingItemOverlay.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 icon icon-tabler icon-tabler-antenna-bars-5" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <line x1="6" y1="18" x2="6" y2="15">
          <animate attributeName="y2" values="0;16;0" begin="0.0s" dur="0.7s" repeatCount="indefinite" />
        </line>
        <line x1="10" y1="18" x2="10" y2="12">
          <animate attributeName="y2" values="0;16;0" begin="0.2s" dur="0.7s" repeatCount="indefinite" />
        </line>
        <line x1="14" y1="18" x2="14" y2="9">
          <animate attributeName="y2" values="0;16;0" begin="0.3s" dur="0.7s" repeatCount="indefinite" />
        </line>
        <line x1="18" y1="18" x2="18" y2="6">
          <animate attributeName="y2" values="0;16;0" begin="0.4s" dur="0.7s" repeatCount="indefinite" />
        </line>
      </svg>
    `;
    playingItemOverlay.classList.remove(`hidden`);
  }
}

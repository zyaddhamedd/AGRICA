import { useSyncExternalStore, useCallback } from "react";

export type WorldKey = 'fresh' | 'frozen' | 'dried';

type SharedWorldStore = {
  world: WorldKey;
  interacted: boolean;
  listeners: Set<() => void>;
};

const g = (typeof window !== "undefined" ? window : globalThis) as unknown as {
  __agricaSharedWorldStore?: SharedWorldStore;
};

if (!g.__agricaSharedWorldStore) {
  g.__agricaSharedWorldStore = {
    world: 'fresh',
    interacted: false,
    listeners: new Set<() => void>(),
  };
}

const store = g.__agricaSharedWorldStore;

export function getSharedWorld(): WorldKey {
  return store.world;
}

export function hasUserInteracted(): boolean {
  return store.interacted;
}

export function setUserInteracted(val: boolean = true): void {
  store.interacted = val;
}

export function setSharedWorld(world: WorldKey, isManual: boolean = false): void {
  if (isManual) {
    store.interacted = true;
  }
  if (store.world !== world) {
    store.world = world;
    store.listeners.forEach((listener) => listener());
  }
}

function subscribe(callback: () => void) {
  store.listeners.add(callback);
  return () => {
    store.listeners.delete(callback);
  };
}

export function useSharedWorld(): [WorldKey, (world: WorldKey, isManual?: boolean) => void] {
  const world = useSyncExternalStore(subscribe, getSharedWorld, () => 'fresh' as WorldKey);

  const update = useCallback((newWorld: WorldKey, isManual: boolean = false) => {
    setSharedWorld(newWorld, isManual);
  }, []);

  return [world, update];
}

export interface WorldCardItem {
  id: string;
  src: string;
  alt: string;
  objectPosition?: string;
  tagline?: string;
}

export interface WorldConfig {
  key: WorldKey;
  label: string;
  number: string;
  microLabel: string;
  actionText: string;
  actionHref: string;
  accentColor: string;
  imgSrc: string;
  textSrc: string;
  cards: WorldCardItem[];
}

export const THREE_WORLDS_LIST: WorldKey[] = ['fresh', 'frozen', 'dried'];

export const THREE_WORLDS_DATA: Record<WorldKey, WorldConfig> = {
  fresh: {
    key: 'fresh',
    label: 'Fresh',
    number: '01',
    microLabel: '01 / FRESH PRODUCE',
    actionText: 'Explore Fresh',
    actionHref: '/products?world=fresh',
    accentColor: '#50A010',
    imgSrc: '/assets/fresh_img.png',
    textSrc: '/assets/fresh_text.png',
    cards: [
      {
        id: 'fresh-1',
        src: '/assets/fresh_img.png',
        alt: 'AGRICA Fresh Produce',
        objectPosition: '50% 50%',
      },
    ],
  },
  frozen: {
    key: 'frozen',
    label: 'Frozen',
    number: '02',
    microLabel: '02 / IQF FROZEN',
    actionText: 'Explore Frozen',
    actionHref: '/products?world=frozen',
    accentColor: '#68AFC7',
    imgSrc: '/assets/frozen_img.png',
    textSrc: '/assets/frozen_text.png',
    cards: [
      {
        id: 'frozen-1',
        src: '/assets/frozen_img.png',
        alt: 'AGRICA IQF Frozen Produce',
        objectPosition: '50% 50%',
      },
    ],
  },
  dried: {
    key: 'dried',
    label: 'Dried',
    number: '03',
    microLabel: '03 / DRIED RANGE',
    actionText: 'Explore Dried',
    actionHref: '/products?world=dried',
    accentColor: '#B76A2B',
    imgSrc: '/assets/dried_img.png',
    textSrc: '/assets/dried_text.png',
    cards: [
      {
        id: 'dried-1',
        src: '/assets/dried_img.png',
        alt: 'AGRICA Dried Botanicals & Herbs',
        objectPosition: '50% 50%',
      },
    ],
  },
};

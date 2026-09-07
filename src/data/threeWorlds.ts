import { useState, useEffect, useCallback } from "react";

export type WorldKey = 'fresh' | 'frozen' | 'dried';

let sharedWorldState: WorldKey = 'fresh';
const sharedWorldListeners = new Set<(world: WorldKey) => void>();

export function getSharedWorld(): WorldKey {
  return sharedWorldState;
}

export function setSharedWorld(world: WorldKey): void {
  if (sharedWorldState !== world) {
    sharedWorldState = world;
    sharedWorldListeners.forEach((listener) => listener(world));
  }
}

export function useSharedWorld(): [WorldKey, (world: WorldKey) => void] {
  const [world, setWorld] = useState<WorldKey>(sharedWorldState);

  useEffect(() => {
    const handleUpdate = (newWorld: WorldKey) => {
      setWorld(newWorld);
    };
    sharedWorldListeners.add(handleUpdate);
    return () => {
      sharedWorldListeners.delete(handleUpdate);
    };
  }, []);

  const update = useCallback((newWorld: WorldKey) => {
    setSharedWorld(newWorld);
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
    cards: [
      {
        id: 'fresh-1',
        src: '/assets/three-worlds.png',
        alt: 'AGRICA Fresh Produce - Egyptian Soil Harvest',
        objectPosition: '0% 50%',
      },
      {
        id: 'fresh-2',
        src: '/assets/product-atlas.png',
        alt: 'AGRICA Fresh Citrus and Field Yield',
        objectPosition: '15% 35%',
      },
      {
        id: 'fresh-3',
        src: '/assets/video_hero_thumb.jpg',
        alt: 'AGRICA Agricultural Origin',
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
    accentColor: '#287B9C',
    cards: [
      {
        id: 'frozen-1',
        src: '/assets/three-worlds.png',
        alt: 'AGRICA IQF Frozen Cold-Chain Produce',
        objectPosition: '50% 50%',
      },
      {
        id: 'frozen-2',
        src: '/assets/product-atlas.png',
        alt: 'AGRICA IQF Berries & Greens Selection',
        objectPosition: '50% 70%',
      },
      {
        id: 'frozen-3',
        src: '/assets/three-worlds.png',
        alt: 'AGRICA Frozen Preservation Discipline',
        objectPosition: '48% 30%',
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
    accentColor: '#B66E28',
    cards: [
      {
        id: 'dried-1',
        src: '/assets/three-worlds.png',
        alt: 'AGRICA Dried Botanicals & Herbs',
        objectPosition: '100% 50%',
      },
      {
        id: 'dried-2',
        src: '/assets/product-atlas.png',
        alt: 'AGRICA Sun-dried Textures & Stability',
        objectPosition: '85% 65%',
      },
      {
        id: 'dried-3',
        src: '/assets/three-worlds.png',
        alt: 'AGRICA Measured Drying Craft',
        objectPosition: '98% 25%',
      },
    ],
  },
};

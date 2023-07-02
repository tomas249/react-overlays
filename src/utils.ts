function initId() {
  let id = 1;
  return () => {
    return String(id++);
  };
}

export const getId = initId();

export function ObjectEntries<T extends object>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export function ObjectKeys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}

export function isKeyOf<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return key in obj;
}
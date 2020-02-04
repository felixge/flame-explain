import React from 'react';

export function useLocalStorage<T>(key: string, defaultVal: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '');
      return data as T;
    } catch {
      return defaultVal;
    }
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

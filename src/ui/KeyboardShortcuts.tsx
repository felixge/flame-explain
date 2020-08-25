import React from 'react';

type callback = (key: string) => void;

export function useKeyboardShortcuts(cb: callback) {
  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLInputElement && e.target.type !== 'checkbox') ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      cb(e.key);
    };
    document.addEventListener('keyup', listener);
    return () => document.removeEventListener('keyup', listener);
  });
}

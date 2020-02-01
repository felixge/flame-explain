import React from 'react';

export const useLocalStorage = (key: string, defaultVal: string): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || defaultVal
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
};

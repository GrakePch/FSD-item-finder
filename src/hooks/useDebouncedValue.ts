import { useEffect, useState } from "react";

const useDebouncedValue = <T,>(value: T, delayMs = 250) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (delayMs <= 0 || value === "") {
      setDebouncedValue(value);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
};

export default useDebouncedValue;

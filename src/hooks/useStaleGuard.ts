import { useRef } from "react";

/**
 * Tracks the token of the most recent request so an async result that
 * resolves after a newer request has superseded it can be ignored.
 */
export function useStaleGuard<T>() {
  const current = useRef<T | undefined>(undefined);
  return {
    markCurrent: (token: T) => { current.current = token; },
    isCurrent: (token: T) => current.current === token,
  };
}

import { useMemo, useRef } from 'react';
import { useFirstMountState } from 'react-use';

export function useConditionalMemo<T>(factory: () => T, deps: React.DependencyList | undefined, shouldRecompute: boolean): T {
  // Casting here means we have to very careful to never access this before it's set
  const valueRef = useRef<T>() as React.MutableRefObject<T>;

  // Require value compute on first run no matter what shouldRecompute is
  const firstMount = useFirstMountState()
  shouldRecompute = shouldRecompute || firstMount

  return useMemo(() => {
    if (shouldRecompute) {
      valueRef.current = factory();
    }
    return valueRef.current;
  }, [shouldRecompute, ...(deps || [])]);
}

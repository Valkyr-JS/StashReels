import { useRef, useMemo, useEffect } from "react";

/**
 * Returns a ref-like object whose `.current` property
 * calls the provided getter function each time it’s accessed.
 */
export function useGetterRef<
  SourceType,
  ReturnedType = SourceType
>(
  getter: (sourceValue: SourceType) => ReturnedType,
  initialValue: SourceType,
  dependencies: React.DependencyList
): React.MutableRefObject<ReturnedType> {
  const valueSourceRef = useRef(initialValue);

  // We use useMemo to create the ref object only once and then
  // use useEffect to update the getter logic based on dependencies
  const getterRef = useMemo(() => {
    const getterRef = {
      get current(): ReturnedType {
        return getter(valueSourceRef.current);
      },
      set current(newValue: SourceType) {
        valueSourceRef.current = newValue;
      }
    }
    return getterRef;
  }, [])

  useEffect(() => {
    Object.defineProperty(getterRef, 'current', {
      get: () => getter(valueSourceRef.current)
    });
  }, dependencies);

  return getterRef;
}

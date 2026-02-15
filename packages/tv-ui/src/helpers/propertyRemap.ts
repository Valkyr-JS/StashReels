const originalDescriptorsObjectMap = new WeakMap<Object, Record<string, PropertyDescriptor>>();

export function propertyRemap<ObjectToModify extends object, ParentObject extends ObjectToModify>(
  parentObject: ParentObject,
  propertyMap: Partial<Record<keyof ObjectToModify, keyof ObjectToModify | ((originalValue: ObjectToModify[keyof ObjectToModify]) => ObjectToModify[keyof ObjectToModify])>>,
  objectToModify: ObjectToModify = parentObject
) {
  // We track the original descriptors for each object so we can be sure to restore them correctly even not matter
  // what order the cleanup functions are called in. But we also need to track the descriptor right before remapping
  // since it might have already been remapped and we want to chain the remaps correctly.
  if (!originalDescriptorsObjectMap.has(objectToModify)) {
    originalDescriptorsObjectMap.set(objectToModify, {});
  }
  const originalDescriptors = originalDescriptorsObjectMap.get(objectToModify) as Record<keyof ObjectToModify, PropertyDescriptor>;
  for (const propName of Object.keys(propertyMap) as (keyof ObjectToModify)[]) {
    if (!(propName in originalDescriptors)) {
      originalDescriptors[propName] = Object.getOwnPropertyDescriptor(objectToModify, propName)!;
    }
  }
  const beforeRemapDescriptors: Record<keyof ObjectToModify, PropertyDescriptor> = Object.fromEntries(
    Object.keys(propertyMap).map((propName) => [
      propName,
      Object.getOwnPropertyDescriptor(objectToModify, propName as keyof ObjectToModify)!
    ])
  ) as Record<keyof ObjectToModify, PropertyDescriptor>;

  // Remap properties
  for (const [propName, mappedPropOrGetter] of Object.entries(propertyMap) as [keyof ObjectToModify, keyof ObjectToModify | ((originalValue: ObjectToModify[keyof ObjectToModify]) => ObjectToModify[keyof ObjectToModify])][] ) {
    const beforeRemapDescriptor = beforeRemapDescriptors[propName];

    let {value, writable, ...other} = beforeRemapDescriptor || {};
    console.log("remapping", propName, "to", mappedPropOrGetter, other)

    if (typeof value === "function") {
      value = value.bind(parentObject);
    }

    Object.defineProperty(objectToModify, propName, {
      ...other,
      get() {
        if (this !== parentObject) {
          return beforeRemapDescriptor.get?.call(this)
        }
        if (typeof mappedPropOrGetter === 'function') {
          return mappedPropOrGetter.call(
            parentObject,
            value || beforeRemapDescriptors[propName].get
          );
        } else {
          return beforeRemapDescriptors[mappedPropOrGetter].get?.call(parentObject);
        }
      },
    });
  }

  // return cleanup function to restore original properties
  return () => {
    // Restore original properties
    for (const propName of Object.keys(propertyMap) as (keyof ObjectToModify)[]) {
      Object.defineProperty(objectToModify, propName, originalDescriptors[propName]);
    }
  }
}

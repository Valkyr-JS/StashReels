import { UpdateInfo } from '@welldone-software/why-did-you-render';
import React from 'react';

const reactFiberTags = {
  "FunctionComponent": 0,
  "ClassComponent": 1,
  "IndeterminateComponent": 2, // Before we know whether it is function or class
  "HostRoot": 3, // Root of a host tree. Could be nested inside another node.
  "HostPortal": 4, // A subtree. Could be part of a different renderer.
  "HostComponent": 5,
  "HostText": 6,
  "Fragment": 7,
  "Mode": 8,
  "ContextConsumer": 9,
  "ContextProvider": 10,
  "ForwardRef": 11,
  "Profiler": 12,
  "SuspenseComponent": 13,
  "MemoComponent": 14,
  "SimpleMemoComponent": 15,
}

declare global {
  interface Window {
    whyDidYouRender: typeof import('@welldone-software/why-did-you-render').default;
    renderComponentTree: () => void;
  }
}

type ComponentTree = {
  fibers: readonly any[], // Make this read only so we can use the object ref as a cache key
  nameDetails: { shortName: string, fullName: string }
}[]

if (import.meta.env.DEV && JSON.parse(localStorage.getItem("enableRenderDebugging") || "false")) {
  console.log("Enabling why-did-you-render");
  const { default: whyDidYouRender } = await import('@welldone-software/why-did-you-render');

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let groupNamePrintRenderInfoHook: ((groupDepth: number, ...args: [string, string]) => unknown[]) | undefined;
  let postGroupNamePrintRenderInfoHook: ((groupDepth: number) => void) | undefined;
  // We don't need a pre or post hook for the whole process of printing info about a render since we may as well just
  // run that code in our notifier function before or after calling the default notifier.
  let currentGroupDepth = -1;
  // Allow overriding whether to collapse groups on a per-group basis
  let collapseGroupOverride: boolean | undefined;

  const customOptions = {
    printComponentTree: true,
    ignoreInside: [
      /ReactSelect/,
    ],
    getPerComponentOptions: ({ prevProps, nextProps }: UpdateInfo): Record<string, {
      collapseGroups?: boolean,
      componentTitlePrintHook?: ((...args: [string, string]) => unknown[]) | undefined,
      hooksToIgnoreRenderFrom?: string[],
    }> => ({
      MediaSlide: {
        collapseGroups: false,
        componentTitlePrintHook: (...args) => {
          let additionalInfo;
          if (nextProps.mediaItem.id !== prevProps.mediaItem.id) {
            additionalInfo = `MediaSlide mediaItem changed from ${prevProps.mediaItem.id} to ${nextProps.mediaItem.id}`;
          } else {
            additionalInfo = ` (ID ${nextProps.mediaItem.id})`;
          }
          return [`${args[0]}%c${additionalInfo}`, args[1], "color: gray; font-style: italic;"];
        },
      },
      VideoScroller: {
        // This is caused by the useVirtualizer hook so not nothing we can do about it
        hooksToIgnoreRenderFrom: ['useReducer'],
      }
    })
  }

  whyDidYouRender(React, {
    include: [
      /App/,
      /FeedPage/,
      /VideoScroller/,
      /MediaSlide/,
      /ScenePlayer/,
      /CrtEffect/,
      /GuideOverlay/,
      /OverflowIndicators/,
      /ActionButton/,
      /SideDrawer/,
      /SettingsTab/,
    ],
    exclude: [
      /IntlProvider/,
      /EmotionCssPropInternal/, // Used by react-select
      /Animated/,
      /FontAwesomeIcon/,
    ],
    collapseGroups: true,
    // @ts-expect-error -- Missing from types but exists in code
    consoleGroup: (...args: [string, string]) => {
      currentGroupDepth++;
      // Pass the group title though hook if there is one and then create the group (with a possibly modified title)
      const groupTitleArgs = groupNamePrintRenderInfoHook
        ? groupNamePrintRenderInfoHook(currentGroupDepth, ...args)
        : args;
      // @ts-expect-error -- wdyrStore is not defined as a property of whyDidYouRender from types but exists in code
      const defaultCollapseGroups = whyDidYouRender.wdyrStore.options.collapseGroups ?? false
      if (collapseGroupOverride ?? defaultCollapseGroups) {
        console.groupCollapsed(...groupTitleArgs)
      } else {
        console.group(...groupTitleArgs)
      }

      // Run post-title hook if there is one
      postGroupNamePrintRenderInfoHook?.(currentGroupDepth);
    },
    consoleGroupEnd: () => {
      console.groupEnd();
      currentGroupDepth--;
    },
    trackAllPureComponents: true,
    logOnDifferentValues: false,
    trackHooks: true,
    ...(isDarkMode ? {
      titleColor: '#5bc0ffff',
      diffNameColor: '#cab6ffff',
    } : {}),
    notifier: (updateInfo) => {
      const { displayName, hookName } = updateInfo;
      const { ignoreInside } = customOptions;

      // We skip logging the render if the component is inside any component in the ignoreInside list
      if (ignoreInside) {
        let reactFiber = getCurrentReactFiber();
        if (reactFiber) {
          const componentTree = getComponentTreeForFiber(reactFiber);
          for (const node of componentTree.toReversed()) {
            const {nameDetails: {shortName}} = node
            if (ignoreInside.some((regex) => shortName.match(regex))) {
              return;
            }
          }
        }
      }

      const perComponentOptions = customOptions.getPerComponentOptions(updateInfo);
      if (displayName in perComponentOptions) {
        const { collapseGroups, componentTitlePrintHook, hooksToIgnoreRenderFrom } = perComponentOptions[displayName];
        if (collapseGroups !== undefined) {
          collapseGroupOverride = collapseGroups;
        }
        if (hooksToIgnoreRenderFrom && hookName && hooksToIgnoreRenderFrom.includes(hookName)) {
          return
        }

        // At this point we're not going to return early so it's safe to setup any hooks only after this point

        if (componentTitlePrintHook) {
          groupNamePrintRenderInfoHook = (groupDepth: number, ...args: [string, string]) => {
            if (groupDepth !== 0) return args; // Only modify top-level group titles
            console.log("Running componentTitlePrintHook for", displayName, args);
            return componentTitlePrintHook(...args);
          }
        }
      }

      postGroupNamePrintRenderInfoHook = (groupDepth: number) => {
        if (groupDepth !== 0) return;
        if (customOptions.printComponentTree) {
          console.groupCollapsed("Component tree at time of render");
          renderComponentTree();
          console.groupEnd();
        }
      }

      whyDidYouRender.defaultNotifier(updateInfo);

      // Clear any per-render hooks or overrides
      groupNamePrintRenderInfoHook = undefined;
      postGroupNamePrintRenderInfoHook = undefined;
      collapseGroupOverride = undefined;
    }
  })

  function renderComponentTree() {
    let reactFiber = getCurrentReactFiber();
    if (!reactFiber) return;
    let processedTree = getComponentTreeForFiber(reactFiber);

    // Go from the root to the leaf merging down context providers into their parent nodes
    for (let i = 0; i < processedTree.length; i++) {
      const node = processedTree[i];
      const fiber = node.fibers[0];
      const parent = processedTree[i - 1];
      if (!fiber) {
        console.warn("Internal error: No fiber found for processed tree node:", node);
      }
      if (!parent) continue;

      if (fiber.tag === reactFiberTags.ContextProvider) {
        parent.fibers = [...parent.fibers, ...node.fibers];
        processedTree.splice(i, 1)
        i--;
        continue
      }
    }

    // Go from the leaf to the root merging down forward refs and memos into their child nodes
    for (let i = processedTree.length - 1; i >= 0; i--) {
      const node = processedTree[i];
      const fiber = node.fibers.at(-1);
      const child = processedTree[i + 1];
      if (!fiber) {
        console.warn("Internal error: No fiber found for processed tree node:", node);
      }
      if (!child) continue;

      if (fiber.tag === reactFiberTags.ForwardRef) {
          child.fibers = [...node.fibers, ...child.fibers];
          processedTree.splice(i, 1)
          continue
      } else if (fiber.tag === reactFiberTags.MemoComponent) {
        child.fibers = [...node.fibers, ...child.fibers];
        processedTree.splice(i, 1)
        continue
      }
    }

    for (let i = 0; i < processedTree.length; i++) {
      const {nameDetails: {fullName}, fibers} = processedTree[i];
      console.groupCollapsed(" ".repeat(i * 2) + fullName, ...fibers.map(fiber => fiber.stateNode).filter(Boolean));
      console.log(...fibers);
      console.groupEnd();
    }
  }

  const componentTreeCache = new WeakMap<any, ComponentTree>();

  function getComponentTreeForFiber(leafFiber: any) {
    if (!leafFiber) return [];

    let componentTree = componentTreeCache.get(leafFiber);
    if (!componentTree) {
      const nameDetailsCache = new WeakMap<any, { shortName: string, fullName: string }>();

      let tree: ComponentTree = []

      let fiber = leafFiber;
      while (fiber) {
        tree.unshift({
          fibers: [fiber],
          get nameDetails() {
            let nameDetails = nameDetailsCache.get(this.fibers);
            if (!nameDetails) {
              let fullName = ""
              let shortName = ""

              const nameOverrides: Record<number, string> = {}
              const ignoreDisplayName: Record<number, boolean> = {}

              const fiberTypesToPassNameToChild = [
                reactFiberTags.MemoComponent,
                reactFiberTags.ForwardRef,
                reactFiberTags.ContextProvider,
              ]

              // Some component types (memo, forwardref, contextprovider) wrap other components and have been given a
              // more human readable name intended to describe the wrapped component. We detect this and record it
              // so we can use that name instead when getting the name for the wrapped component.
              for (let i = 0; i < this.fibers.length; i++) {
                const fiber = this.fibers[i];
                const displayName = fiber.type?.displayName;
                if (!displayName) continue;
                if (fiberTypesToPassNameToChild.includes(fiber.tag)) {
                  for (let j = i + 1; j < this.fibers.length; j++) {
                    const childFiber = this.fibers[j];
                    if (!fiberTypesToPassNameToChild.includes(childFiber.tag)) {
                      nameOverrides[j] = displayName;
                      ignoreDisplayName[i] = true;
                      break;
                    }
                  }
                }
              }

              const prependComponent = (newComponent: string) => {
                fullName = fullName ? `${newComponent} + ${fullName}` : newComponent;
              }
              const wrapComponent = (newComponent: string) => {
                fullName = `${newComponent}(${fullName})`
              }

              for (let i = this.fibers.length - 1; i >= 0; i--) {
                const fiber = this.fibers[i];
                const displayName = nameOverrides[i]
                  || (!ignoreDisplayName[i] && fiber.type?.displayName !== "Unknown" && fiber.type?.displayName)
                  || fiber.type?.name
                if (fiber.tag === reactFiberTags.MemoComponent) {
                  wrapComponent("Memo" + (displayName ? `[${displayName}]` : ""))
                  if (displayName) {
                    shortName = displayName;
                  }
                } else if (fiber.tag === reactFiberTags.ForwardRef) {
                  wrapComponent("ForwardRef" + (displayName ? `[${displayName}]` : ""))
                  if (displayName) {
                    shortName = displayName;
                  }
                } else if (fiber.tag === reactFiberTags.ContextProvider) {
                  prependComponent(`<ContextProvider${displayName ? `[${displayName}]` : ""}>`)
                  if (displayName) {
                    shortName = displayName;
                  }
                } else if (fiber.tag === reactFiberTags.HostRoot) {
                  prependComponent("$root" + (displayName ? `[${displayName}]` : ""))
                } else if (fiber.tag === reactFiberTags.Fragment) {
                  prependComponent("<$fragment>")
                } else {
                  const name = displayName
                    || (typeof fiber.type?.["$$typeof"] === "symbol" && fiber.type["$$typeof"].description)
                    || (typeof fiber.type === "string" && fiber.type)
                    || "Unknown"
                  prependComponent(
                    `<${name}>`
                  )
                  shortName = name;
                }
              }

              for (const i of this.fibers.keys()) {
                if (nameOverrides[i]) {
                  shortName = nameOverrides[i];
                  break;
                }
              }

              nameDetails = {
                shortName,
                fullName
              }
              nameDetailsCache.set(this.fibers, nameDetails);
            }
            return nameDetails;
          }
        });
        fiber = fiber.return;
      }
      componentTree = tree;
      componentTreeCache.set(leafFiber, componentTree);
    }
    return componentTree;
  }

  function getCurrentReactFiber() {
    // @ts-expect-error -- Using internal React API since this is a dev only tool and it doesn't matter if it breaks in
    // future React versions
    let reactFiber = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current
    if (!reactFiber) {
      console.warn("Failed to load Component tree. No React fiber found.");
    }
    return reactFiber;
  }

  window.whyDidYouRender = whyDidYouRender;
  window.renderComponentTree = renderComponentTree
}

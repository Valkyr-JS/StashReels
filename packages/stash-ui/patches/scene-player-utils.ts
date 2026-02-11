import videojs from "video.js";

export let VIDEO_PLAYER_ID = "";

export const getPlayerPosition = () =>
  videojs.getPlayer(VIDEO_PLAYER_ID)?.currentTime();

watchForCurrentVideoClass(element => {
  VIDEO_PLAYER_ID = element.querySelector('video-js')?.id || "";
})

function watchForCurrentVideoClass(callback: (element: Element) => void): () => void {
  const observers: MutationObserver[] = [];

  function observeVideoScroller(videoScroller: Element): void {
    function handleCurrentVideoElement(target: Element): void {
      if (target.querySelector('video-js')) {
        callback(target);
      } else {
        // Wait for video-js element to be added
        const videoJsObserver = new MutationObserver((mutations: MutationRecord[]) => {
          if (target.querySelector('video-js')) {
            callback(target);
            videoJsObserver.disconnect();
          }
        });

        videoJsObserver.observe(target, {
          childList: true,
          subtree: true
        });

        observers.push(videoJsObserver);
      }
    }

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as Element;
          // Check if target is a direct child of videoScroller
          if (target.parentElement === videoScroller && target.classList.contains('current-video')) {
            handleCurrentVideoElement(target);
          }
        }
      });
    });

    observer.observe(videoScroller, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true // Need subtree to observe children
    });

    for (const child of videoScroller.children) {
      if (child.classList.contains('current-video')) {
        handleCurrentVideoElement(child);
      }
    }

    observers.push(observer);
  }

  // Observe all existing VideoScroller elements
  document.querySelectorAll('.VideoScroller').forEach(observeVideoScroller);

  // Optionally watch for new VideoScroller elements being added
  const rootObserver = new MutationObserver((mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.classList?.contains('VideoScroller')) {
            observeVideoScroller(element);
          }
          // Check descendants too
          element.querySelectorAll?.('.VideoScroller').forEach(observeVideoScroller);
        }
      });
    });
  });

  rootObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  observers.push(rootObserver);

  // Return disconnect function
  return () => observers.forEach(obs => obs.disconnect());
}

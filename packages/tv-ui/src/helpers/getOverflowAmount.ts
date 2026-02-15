export function getOverflowAmount(parentElement: Element) {
  const parentRect = parentElement.getBoundingClientRect();

  let overflow = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  function traverse(element: Element) {
    const children = Array.from(element.children);

    for (const child of children) {
      const style = getComputedStyle(child);
      if (style.display === 'none') continue; // Skip hidden elements
      const hasOverflowHidden =
        style.overflow === 'hidden' ||
        style.overflowX === 'hidden' ||
        style.overflowY === 'hidden' ||
        style.overflow === 'clip' ||
        style.overflowX === 'clip' ||
        style.overflowY === 'clip' ||
        style.overflow === 'auto' ||
        style.overflowX === 'auto' ||
        style.overflowY === 'auto';

      const childRect = child.getBoundingClientRect();

      const overflowAmount = {
        left: Math.max(0, parentRect.left - childRect.left),
        top: Math.max(0, parentRect.top - childRect.top),
        right: Math.max(0, childRect.right - parentRect.right),
        bottom: Math.max(0, childRect.bottom - parentRect.bottom)
      }

      overflow.left = Math.max(overflow.left, overflowAmount.left);
      overflow.top = Math.max(overflow.top, overflowAmount.top);
      overflow.right = Math.max(overflow.right, overflowAmount.right);
      overflow.bottom = Math.max(overflow.bottom, overflowAmount.bottom);

      // Only traverse deeper if overflow is not hidden/clip
      if (!hasOverflowHidden) {
        traverse(child);
      }
    }
  }

  traverse(parentElement);

  return overflow;
}

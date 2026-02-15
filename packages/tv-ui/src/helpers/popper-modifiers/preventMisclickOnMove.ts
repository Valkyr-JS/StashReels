import {Options as PopperOptions} from '@popperjs/core';

export const preventMisclickOnMoveModifier: PopperOptions['modifiers'][number] = {
  name: 'preventMisclickOnMove',
  phase: 'main',
  enabled: true,
  effect({state}) {
    const {popper} = state.elements
    let mouseDownInsidePopper = false
    function mouseDownHandler(event: MouseEvent) {
      mouseDownInsidePopper = true
    }
    function clickHandler(event: MouseEvent) {
      if (mouseDownInsidePopper && event.target instanceof Node && !popper.contains(event.target)) {
        event.stopPropagation()
        event.preventDefault()
      }
      mouseDownInsidePopper = false
    }
    popper.addEventListener("mousedown", mouseDownHandler)
    window.addEventListener("click", clickHandler, {capture: true})
    return () => {
      popper.removeEventListener("mousedown", mouseDownHandler)
      window.removeEventListener("click", clickHandler, {capture: true})
    };
  },
}

import { getOverflowAmount } from "../getOverflowAmount";
import {Options as PopperOptions} from '@popperjs/core';


export const preventChildOverflowModifier: PopperOptions['modifiers'][number] = {
  name: 'includePopperOverflowInPadding',
  enabled: true,
  phase: 'main',
  requires: ['offset'],
  fn({state, instance, name}) {
    const popoverElement = state.elements.popper;
    const popoverContentsElement = popoverElement.querySelector(".contents")

    if (!popoverContentsElement) {
      console.warn("Could not find popover contents element, skipping overflow prevention")
      return
    }

    const preventOverflowModifier = state.options.modifiers.find(m => m.name === 'preventOverflow')
    const self = state.options.modifiers.find(m => m.name === name)
    self.persistentData = self.persistentData || {}
    const {persistentData} = self
    if (!persistentData.originalPadding) {
      if (typeof preventOverflowModifier.options.padding !== 'object') {
        console.warn("Unexpected padding format for preventOverflow modifier, expected object but got", preventOverflowModifier.options.padding)
        return
      }
      persistentData.originalPadding = {...preventOverflowModifier.options.padding}
    }
    const overflowAmountChanged = () => {
      const heightWithOverflow = popoverContentsElement.scrollHeight
      const widthWithOverflow = popoverContentsElement.scrollWidth
      const previousHeightWithOverflow = persistentData.previousSizeWithOverflow?.height || popoverContentsElement.clientHeight
      const previousWidthWithOverflow = persistentData.previousSizeWithOverflow?.width || popoverContentsElement.clientWidth
      const changed = (heightWithOverflow !== previousHeightWithOverflow) || (widthWithOverflow !== previousWidthWithOverflow)
      persistentData.previousSizeWithOverflow = {height: heightWithOverflow, width: widthWithOverflow}
      return changed
    }
    const updatePadding = () => {
      const overflowAmount = getOverflowAmount(popoverContentsElement)
      preventOverflowModifier.options.padding.top = persistentData.originalPadding.top + overflowAmount.top
      preventOverflowModifier.options.padding.left = persistentData.originalPadding.left + overflowAmount.left
      preventOverflowModifier.options.padding.right = persistentData.originalPadding.right + overflowAmount.right
      preventOverflowModifier.options.padding.bottom = persistentData.originalPadding.bottom + overflowAmount.bottom
    }

    if (overflowAmountChanged()) {
      updatePadding()
    }

    const intervalId = setInterval(() => {
      if (overflowAmountChanged()) {
        updatePadding()
        clearInterval(intervalId);
        instance.forceUpdate()
      }
    }, 100)
  },
}

import {Options as PopperOptions} from '@popperjs/core';

// Taken from https://popper.js.org/docs/v2/modifiers/arrow/#data
export const applyArrowHideModifier: PopperOptions['modifiers'][number] = {
  name: 'applyArrowHide',
  enabled: true,
  phase: 'write',
  fn({ state }) {
    const { arrow } = state.elements;

    if (arrow && state.modifiersData.arrow) {
      if (state.modifiersData.arrow.centerOffset !== 0) {
        arrow.setAttribute('data-hide', '');
      } else {
        arrow.removeAttribute('data-hide');
      }
    }
  },
}

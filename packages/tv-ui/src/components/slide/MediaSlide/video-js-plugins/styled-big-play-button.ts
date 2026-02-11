import { type VideoJsPlayer } from 'video.js';
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

const faPlayIcon = icon(faPlay)

export const styledBigPlayButton = function(
  this: VideoJsPlayer,
  options: {}
) {
  const player = this;

  player.ready(() => {
    const button = player.bigPlayButton?.el();
    if (!button) return;

    button.innerHTML = '';
    button.insertAdjacentElement('beforeend', faPlayIcon.node[0]);
  });
};

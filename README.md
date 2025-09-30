<p align="center">
  <img alt="Stash TV Logo - A cardboard box with antennas sticking out from it." src="https://raw.githubusercontent.com/secondfolder/stash-tv/main/packages/tv-ui/src/public/apple-touch-icon.png">
</p>

# Stash TV

Stash TV allows you to swipe through scene playlists based on your Stash filters. Featuring a non-instrusive, hideable
UI, Stash TV is based heavily on apps like TikTok and Instagram. It's been forked from [Stash
Reels](https://github.com/Valkyr-JS/StashReels) and is currently not that different.

<p align="center">
  <img alt="Screenshot of the main stash tv interface." src="https://raw.githubusercontent.com/secondfolder/stash-tv/main/docs/stash-tv-screenshot.png">
</p>

**Features:**
- Tap to jump forwards or back in the video.
- Scrub though the video with a video thumbnail.
- Video tags shown on the video progress bar.
- Video rotation for easy landscape viewing when lying down on your side.
- A fun CRT TV filter option.


## Installation

1. Add the [secondfolder stash-plugins source](https://github.com/secondfolder/stash-plugins) to Stash if it hasn't been
   added already.
<ul>
<li>
<details>
<summary>Instructions</summary>

Plugins can be installed and managed from the **Settings** > **Plugins** page.

Under the **Available Plugins** section click **Add Source** and enter the following details:

**Name:**
```
secondfolder's plugins (stable)
```
**Source URL:**
```
https://secondfolder.github.io/stash-plugins/stable/index.yml
```
**Local Path:**
```
secondfolder-stable
```

</details>
</li>
</ul>

2. In **Settings** > **Plugins** find **Stash TV** under **Available Plugins** > **secondfolder's plugins (stable)**, select it then click **Install**.

## Using Stash TV

Click the new **TV** link in the nav bar at the top of Stash (this link can be disabled in the plugin settings if desired).

### User interface

Tap anywhere on the right or left third of the video to skip forward and back in the current video (you can also use the left and
right arrow keys).
Swipe up or down (or use the up and down arrow keys) to go to the next or pervious video.

The following buttons appear on the right-hand side of the screen for each scene:

1. Toggle audio mute/unmute
2. Toggle subtitles (only appears if subtitles are available)
3. Toggle fullscreen mode
4. Toggle letterboxed/fill screen
5. Toggle view rotation (useful on a phone to quickly enable landscape viewing when laying on side)
6. Toggle looping the current scene
7. Toggle scene info (only appears if scene info is available)
8. Settings
9. Toggle UI visibility

At the bottom of the screen is the scene scrubber, showing the current scene progress and timecode. This can be tapped to move back/forward in the scene.

### Settings

1. Select a playlist - Choose from one of your Stash scene filters in the dropdown to use as a playlist. If you don't have any scene filters, all portrait scenes will be fetched as a default playlist.
2. Set current playlist as default - Makes the currently selected playlist the default when Stash TV is launched. (Only
   shown if currently selected playlist is not already default)
3. Randomise playlist order. (Only shown if currently selected playlist is not already sorted by random.)
4. Subtitle language - Set your preferred subtitle language. If subtitles are available for a scene in this language,
   they will be displayed. These can be toggled on or off in the main scene UI.
5. CRT Effect - A fun little filter that simulates an old CRT TV look (you can also press the "c" key to toggle this).

## Technical info

The user experience quality of Stash TV is highly dependant on the setup of each user. A slow server and a poor network speed can result in longer buffering times between scenes.

Stash TV only loads up to eleven scenes at once - the current scene, and up to five before and after it - in order to provide as smooth an experience when swiping through scenes, without overloading the browser's memory.

As of version 0.1.2, a config option has been added in the Stash plugin settings to set the maximum number of scenes loaded in a playlist. The default is 500. Increasing or decreasing this number will reduce or increase load times respectively.

# Stash TV

Stash TV allows you to swipe through scene playlists based on your Stash filters. Featuring a non-instrusive, hideable
UI, Stash TV is based heavily on apps like TikTok and Instagram. It's been forked from [Stash
Reels](https://github.com/Valkyr-JS/StashReels) and is currently not that different.

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

The following buttons appear on the right-hand side of the screen for each scene;

1. Toggle audio mute/unmute
2. Toggle subtitles (only appears if subtitles are available)
3. Toggle fullscreen mode
4. Toggle letterboxed/fill screen
5. Toggle looping the current scene
6. Toggle scene info (only appears if scene info is available)
7. Settings
8. Toggle UI visibility.

At the bottom of the screen is the scene scrubber, showing the current scene progress and timecode. This can be tapped to move back/forward in the scene.

### Settings

1. Select a playlist - Choose from one of your Stash scene filters in the dropdown to use as a playlist. If you don't have any scene filters, all portrait scenes will be fetched as a default playlist.
2. Set current playlist as default - Makes the currently selected playlist the default when Stash TV is launched.
3. Randomise playlist order
4. Subtitle lanugage - Set your preferred subtitle language. If subtitles are available for a scene in this language, they will be displayed. These can be toggled on or off in the main scene UI.

## Technical info

The user experience quality of Stash TV is highly dependant on the setup of each user. A slow server and a poor network speed can result in longer buffering times between scenes.

Stash TV only loads up to eleven scenes at once - the current scene, and up to five before and after it - in order to provide as smooth an experience when swiping through scenes, without overloading the browser's memory.

As of version 0.1.2, a config option has been added in the Stash plugin settings to set the maximum number of scenes loaded in a playlist. The default is 500. Increasing or decreasing this number will reduce or increase load times respectively.

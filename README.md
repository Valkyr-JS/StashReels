# Stash Reels

Stash Reels allows you to swipe through scene playlists based on your Stash filters. Featuring a non-instrusive, hideable UI, Stash Reels is based heavily on apps like TikTok and Instagram.

## Beta notice - rebuild in progress

Thanks to the great feedback for this plugin, I've decided to rebuild it from the ground up to better incorporate suggestions. This current build will only be updated to fix breaking issues; no new features will be added before the rebuild release.

The rebuild will feature a full user interface for browsing all Stash content, not just scenes. At least scenes and markers will be supported on initial release, with more added later. If you have any suggestions for features you'd like to see, please raise them in [the GitHub repository for the rebuild](https://github.com/Valkyr-JS/StashReelsRedux/issues).

## Installation

1. In Stash go to Settings > Plugins
2. Under Available Plugins click Add Source
3. Fill out the fields in the popup form. Name and Local Path can be whatever you like, but Source URL needs to match the below. I use the following;
   - Name: Valkyr-JS
   - Source URL: https://valkyr-js.github.io/stash-plugins/index.yml
   - Local Path: Valkyr-JS
4. Click confirm and you should see new line under Available Plugins called Valkyr-JS (or whatever you used for Name). Click this and you'll see my available plugins.
5. Check "Stash Reels" and then click Install in the top right of Available Plugins.
6. (Optional) Configure the plugin under the Plugins panel below Available plugins.

## Using Stash Reels

To access Stash Reels, visit `http://<YourStashDomain>/plugin/StashReels/assets/app/`. By default, the plugin adds a link to the main Stash navbar, though this can be disabled on the plugin settings page.

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
2. Set current playlist as default - Makes the currently selected playlist the default when Stash Reels is launched.
3. Randomise playlist order
4. Subtitle lanugage - Set your preferred subtitle language. If subtitles are available for a scene in this language, they will be displayed. These can be toggled on or off in the main scene UI.

## Technical info

The user experience quality of Stash Reels is highly dependant on the setup of each user. A slow server and a poor network speed can result in longer buffering times between scenes.

Stash Reels only loads up to eleven scenes at once - the current scene, and up to five before and after it - in order to provide as smooth an experience when swiping through scenes, without overloading the browser's memory.

As of version 0.1.2, a config option has been added in the Stash plugin settings to set the maximum number of scenes loaded in a playlist. The default is 500. Increasing or decreasing this number will reduce or increase load times respectively.

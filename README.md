<p align="center">
  <img alt="Stash TV Logo - A cardboard box with antennas sticking out from it." src="https://raw.githubusercontent.com/secondfolder/stash-tv/main/packages/tv-ui/src/public/apple-touch-icon.png">
</p>

# Stash TV

Stash TV allows you to view your scenes and markers by swiping though them similar to TikTok. It's based on [Stash
Reels](https://github.com/Valkyr-JS/StashReels) with some performance improvements and additional features.

<p align="center">
  <img alt="Screenshot of the main stash tv interface." src="https://raw.githubusercontent.com/secondfolder/stash-tv/main/docs/stash-tv-screenshot.png">
</p>

**Features:**
- Filter scenes or markers using your saved filters in Stash.
- Tap to jump forwards or back in the video.
- Scrub though the video with a video thumbnail.
- Video tags shown on the video progress bar.
- Video rotation for easy landscape viewing when lying down on your side.
- A fun CRT TV filter option.
- Updates your play count in Stash for scenes you watch.
- Optionally play just a scene's short preview.


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

Click the new **TV** link in the nav bar at the top of Stash (this button can be disabled in the plugin settings if desired).

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

1. Select a filter - Choose from one of your Stash scene filters in the dropdown. If you don't have any filters, all portrait scenes will be fetched as a default filter.
2. Set current filter as default - Makes the currently selected filter the default when Stash TV is launched. (Only
   shown if currently selected filter is not already default)
3. Randomise filter order. (Only shown if currently selected filter is not already sorted by random.)
4. Subtitle language - Set your preferred subtitle language. If subtitles are available for a scene in this language,
   they will be displayed. These can be toggled on or off in the main scene UI.
5. CRT Effect - A fun little visual filter that simulates an old CRT TV look (you can also press the "c" key to toggle this).

## Roadmap
A very rough list of features I'd like to add at some point can be found in the [Stash TV thread in the Stash
Forums](https://discourse.stashapp.cc/t/stash-tv/3627#p-7207-roadmap-6). You can make any feature ideas you have in
either a GitHub ticket or a post in that forum.

## Contributing
### Run the dev server
To run first copy the sample `.env` file
```shell
cp packages/tv-ui/.env.sample packages/tv-ui/.env
```
Then update the env vars in the new `packages/tv-ui/.env` file.

Now you can install the required dependences and run the dev server
```shell
yarn install
yarn --cwd packages/stash-ui setup
yarn dev
```

### Commit info
Commit messages should use the [Conventional Commits](https://www.conventionalcommits.org/) format as release notes are
generated automatically from the commit history.

### Technical info
The codebase is split into 3 packages.
- `packages/tv-ui` is where the actual app code for the plugin lives.
- `packages/tv-plugin` is responsible for taking that web app and bundling it into a form that Stash recognises as a
  plugin. It also includes any UI that is injected directly in Stash's existing UI.
- `packages/stash-ui` includes a copy of the actual
Stash app codebase along with some code to extract and the frontend code from that. This is so we can reuse various parts
of Stash's frontend code such as react components, Stash API client and typescript types without needing to rewrite all that
ourselves or try to manually keep a copies of any useful extracted code in sync.

We use the same Apollo client as the stash frontend with a small wrapper around it to make a few tweaks and some additions to the GraphQL
schema so that we can optimise what data we fetch from the API. At first we load 20 scenes/makers but as the user approaches the
bottom of the list of loaded media we load some more. The code for loading media is abstracted out into a hook
(`useMediaItems()` in `packages/tv-ui/src/hooks/useMediaItems.ts`).

The storybook code is from the original Stash Reels fork and is currently broken as it hasn't yet been updated to
working with the major code refactoring in Stash TV.

Most of the app's state lives in a Zustand store in `packages/tv-ui/src/store/appStateStore.ts` so that it can be
accessed anywhere in the codebase without needing to do lots of prop drilling.
`packages/tv-ui/src/store/stashConfigStore.ts` manages fetching and saving any config that lives in Stash, both general
Stash settings and config info that we save into Stash's plugin config storage. This include such as the user's default
Stash TV filter although the code for using and updating this is encapsulated in it's own hook (`useMediaItemFilters()`
in `packages/tv-ui/src/hooks/useMediaItemFilters.ts`).

Stash's ScenePlayer component is in some ways tightly coupled to Stash's codebase so
`packages/tv-ui/src/components/ScenePlayer` is a wrapper around it that tries to make it a little more contained and
provide more options for tweaking it's behaviour. That is intended to be a bit more of a generic component that could be
used in other Stash related plugins where as `packages/tv-ui/src/components/VideoItem` uses ScenePlayer but adds explicitly Stash
TV related additions.

The `forceLandscape` setting (toggled by the "view rotation" button) is a bit complex since a bunch of things break when
you rotate the entire page. We need to do a bunch of tricks to make that work like catching and remapping various
mouse/touch events. Currently the code for this feature is a little bit scatted all over the place such as in
`packages/tv-ui/src/app/App.tsx` and `packages/tv-ui/src/styles/globals.scss` but at some point I hope to refactor this
into one place as much as possible.
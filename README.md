# Video Aspect Ratio and Speed Controller Extension

This extension allows you to change the aspect ratio and playback speed of videos on any website.

## Installation

1. Open Microsoft Edge.
2. Go to `edge://extensions/`
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the folder `edge-video-aspect-ratio-extension`.

## Usage

1. Click the extension icon in the toolbar.
2. Enter the desired aspect ratio in the format "width:height" (e.g., "16:9") or click an aspect ratio preset.
3. Click "Apply Aspect Ratio" to change the aspect ratio of all videos on the current page.
4. Click "Reset" in the aspect ratio section to remove the custom aspect ratio.
5. Enter a playback speed or click one of the speed preset buttons.
6. Click "Apply Speed" to change the speed of all videos on the current page.
7. Click "Reset Speed" to return videos to normal speed.

## Features

- Works on any website with video elements.
- Applies the new aspect ratio to all videos on the page.
- Includes quick aspect ratio presets for 16:9, 21:9, 4:3, 1:1, and 9:16.
- Applies the selected playback speed to all videos on the page.
- Resets aspect ratio and playback speed independently.

## Notes

- The aspect ratio change is applied by setting CSS `aspect-ratio`, `width`, and `height` on each video.
- The speed change is applied through each video's `playbackRate` property.
- Refresh the page to reset to original aspect ratios and playback speed.

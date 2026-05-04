let activeVideoId = null;
let nextVideoId = 1;
const videoControls = new Map();
const ASPECT_PRESETS = ['16:9', '16:10', '21:9', '4:3', '1:1', '9:16'];
const SPEED_PRESETS = [1, 1.5, 2];
const PANEL_WIDTH = 260;
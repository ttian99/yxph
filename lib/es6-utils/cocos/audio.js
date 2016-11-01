let em = true;  // enableMuisc
let ee = true;  // enableEffect
let aKey = null; // audioKey, 存储到localStorage中的Key值

function save() {
  if (!aKey) return;

  const rst = {
    disableMusic: !em,
    disableEffect: !ee,
  };
  cc.sys.localStorage.setItem(aKey, JSON.stringify(rst));
}

function load() {
  if (aKey) {
    const rst = cc.sys.localStorage.getItem(aKey);
    if (!rst) return;

    try {
      const json = JSON.parse(rst);
      em = !json.disableMusic;
      ee = !json.disableEffect;
    } catch (err) {
      console.log('load audio info failed');
    }
  }
}

export function audioInit(audioKey) {
  aKey = audioKey;
  load();
}

export function isEnableMusic() {
  return em;
}

export function isEnableEffect() {
  return ee;
}

export function playMusic(url, loop = true) {
  em && cc.audioEngine.playMusic(url, loop);
}

export function pauseMusic() {
  em && cc.audioEngine.pauseMusic();
}

export function resumeMusic() {
  em && cc.audioEngine.resumeMusic();
  // cc.audioEngine.setMusicVolume(1);
}

export function stopMusic() { // (releaseData = true) {
  // cc.audioEngine.stopMusic(releaseData);
  // cc.audioEngine.setMusicVolume(0);
  cc.audioEngine.stopMusic(true);
}

export function playEffect(url, loop = false) {
  ee && cc.audioEngine.playEffect(url, loop);
}

export function stopAllEffects() {
  cc.audioEngine.stopAllEffects();
}

export function enableMusic(url) {
  em = true;
  playMusic(url);
  save();
}

export function disableMusic() {
  stopMusic();
  em = false;
  save();
}

export function enableEffect() {
  ee = true;
  save();
}

export function disableEffect() {
  stopAllEffects();
  ee = false;
  save();
}

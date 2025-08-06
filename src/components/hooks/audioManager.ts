// utils/audioManager.ts
let currentAudio: HTMLAudioElement | null = null;
let currentId: string | null = null;

export const audioManager = {
  setCurrentAudio: (id: string, audio: HTMLAudioElement) => {
    if (currentAudio && currentId !== id) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = audio;
    currentId = id;
  },
  
  stopCurrent: () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = null;
    currentId = null;
  },
  
  getCurrentId: () => currentId,
  
  isCurrentlyPlaying: (id: string) => currentId === id
};

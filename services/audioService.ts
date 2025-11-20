
// Simple Audio Manager using widely available UI sound effects
// In a production app, these would be local assets

const SOUNDS = {
  click: 'https://actions.google.com/sounds/v1/ui/click_2.ogg', // Crisp UI click
  success: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg', // Satisfying pop/success
  complete: 'https://actions.google.com/sounds/v1/science_fiction/scifi_laser_gun_fire_1.ogg', // Quest complete (short sci-fi chirp)
  levelUp: 'https://actions.google.com/sounds/v1/science_fiction/music_box_synthesized.ogg', // Ascending magical chime
  error: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg', // Error/Deny
  type: 'https://actions.google.com/sounds/v1/foley/keyboard_typing_fast.ogg', // Typing ambient
};

class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = 0.4; // Default volume
      this.audioCache.set(key, audio);
    });
  }

  play(key: keyof typeof SOUNDS) {
    if (!this.enabled) return;
    
    const audio = this.audioCache.get(key);
    if (audio) {
      // Clone node to allow overlapping sounds (rapid clicks)
      const sound = audio.cloneNode() as HTMLAudioElement;
      sound.volume = key === 'levelUp' ? 0.6 : 0.3;
      sound.play().catch(() => {
        // Ignore autoplay policy errors
      });
    }
  }

  toggle(on: boolean) {
    this.enabled = on;
  }
}

export const audio = new AudioService();

import * as ex from 'excalibur'

export class AudioManager {
  private sounds: Map<string, ex.Sound> = new Map()
  private currentMusic: ex.Sound | null = null
  private isMuted: boolean = false
  private musicVolume: number = 0.3 // 30% volume by default

  constructor() {
    // Initialize background music
    this.sounds.set('tavern', new ex.Sound('/music/tavern_between_adventures.mp3'))
  }

  async loadResources(loader: ex.Loader) {
    for (const [_, sound] of this.sounds) {
      loader.addResource(sound)
    }
  }

  playBackgroundMusic(name: string = 'tavern', loop: boolean = true) {
    const sound = this.sounds.get(name)
    if (!sound) {
      console.warn(`Sound not found: ${name}`)
      return
    }

    // Stop current music if playing
    if (this.currentMusic && this.currentMusic.isPlaying()) {
      this.currentMusic.stop()
    }

    this.currentMusic = sound
    this.currentMusic.volume = this.isMuted ? 0 : this.musicVolume
    this.currentMusic.loop = loop
    this.currentMusic.play()
  }

  stopBackgroundMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop()
      this.currentMusic = null
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted
    
    if (this.currentMusic) {
      this.currentMusic.volume = this.isMuted ? 0 : this.musicVolume
    }
    
    return this.isMuted
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    
    if (this.currentMusic) {
      this.currentMusic.volume = this.isMuted ? 0 : this.musicVolume
    }
  }

  getMuted(): boolean {
    return this.isMuted
  }

  setVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    
    if (this.currentMusic && !this.isMuted) {
      this.currentMusic.volume = this.musicVolume
    }
  }

  getVolume(): number {
    return this.musicVolume
  }

  pause() {
    if (this.currentMusic && this.currentMusic.isPlaying()) {
      this.currentMusic.pause()
    }
  }

  resume() {
    if (this.currentMusic && !this.currentMusic.isPlaying()) {
      this.currentMusic.play()
    }
  }

  cleanup() {
    this.stopBackgroundMusic()
  }
}

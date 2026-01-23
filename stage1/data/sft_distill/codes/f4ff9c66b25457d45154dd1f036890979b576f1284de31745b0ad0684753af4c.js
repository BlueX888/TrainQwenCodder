const config = {
  type: Phaser.HEADLESS,
  width: 320,
  height: 320,
  scene: {
    preload() {
      // no external assets
    },
    create() {
      const g = this.add.graphics();
      g.fillStyle(16711680, 1);
      g.fillRect(20, 20, 60, 60);
      this.tweens.add({ targets: g, alpha: 0.2, yoyo: true, repeat: -1, duration: 400 });
      this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {});
    }
  }
};
new Phaser.Game(config);

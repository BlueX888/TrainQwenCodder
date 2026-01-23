const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 240,
  scene: {
    preload() {
      // no external assets
    },
    create() {
      const g = this.add.graphics();
      g.fillStyle(16776960, 1);
      g.fillRect(20, 20, 60, 60);
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {});
    }
  }
};
new Phaser.Game(config);

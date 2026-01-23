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
      g.fillStyle(16776960, 1);
      g.fillRect(20, 20, 60, 60);
      this.add.text(10, 10, 'score: 0');
      this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {});
    }
  }
};
new Phaser.Game(config);

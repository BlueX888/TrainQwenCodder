const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('square', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建方块精灵，放置在屏幕中央
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 1000,            // 动画持续时间 1 秒
    yoyo: true,                // 反向播放（不透明再变回透明）
    repeat: -1,                // 无限循环（-1 表示永久重复）
    ease: 'Linear'             // 线性缓动函数
  });
}

new Phaser.Game(config);
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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制一个方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('square', 100, 100);
  graphics.destroy();

  // 创建精灵对象
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);

  // 创建补间动画：从透明到不透明，3 秒内完成，循环播放
  this.tweens.add({
    targets: square,        // 动画目标对象
    alpha: 1,               // 目标透明度值（完全不透明）
    duration: 3000,         // 动画持续时间 3 秒
    yoyo: true,             // 启用往返效果（不透明后再变回透明）
    repeat: -1,             // 无限循环（-1 表示永久重复）
    ease: 'Linear'          // 线性缓动函数，均匀变化
  });
}

new Phaser.Game(config);
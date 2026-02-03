const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('squareTexture', 100, 100);
  graphics.destroy();

  // 创建方块精灵，放置在屏幕中央
  const square = this.add.sprite(400, 300, 'squareTexture');
  square.setOrigin(0.5, 0.5);

  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: square,
    scaleX: 0.48,  // 缩放到 48%
    scaleY: 0.48,
    duration: 1500, // 1.5 秒
    yoyo: true,     // 往返效果（缩小后再放大）
    loop: -1,       // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });

  // 添加提示文本
  this.add.text(400, 50, 'Square scaling to 48% and back', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Loop animation: 1.5s to 48%, 1.5s back to 100%', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
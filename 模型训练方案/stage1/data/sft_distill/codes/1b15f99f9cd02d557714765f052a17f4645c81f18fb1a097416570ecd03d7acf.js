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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectTexture', 150, 100);
  graphics.destroy();

  // 创建矩形精灵并放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');

  // 创建缩放动画
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,        // 缩放到 80%
    scaleY: 0.8,        // 缩放到 80%
    duration: 2500,     // 2.5 秒
    yoyo: true,         // 自动返回原始值
    loop: -1,           // 无限循环 (-1 表示永久循环)
    ease: 'Sine.easeInOut'  // 使用平滑的缓动效果
  });

  // 添加提示文本
  this.add.text(400, 50, '矩形缩放动画 (2.5秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
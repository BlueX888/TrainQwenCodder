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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy();

  // 创建矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');
  rect.setOrigin(0.5, 0.5);

  // 创建缩放动画
  // 从原始大小 (scale: 1) 缩放到 16% (scale: 0.16)，然后恢复到原始大小
  this.tweens.add({
    targets: rect,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 1500, // 缩小过程 1.5 秒
    ease: 'Sine.easeInOut',
    yoyo: true, // 自动反向播放（恢复到原始大小）
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });

  // 添加文字说明
  this.add.text(400, 50, 'Rectangle scaling to 16% and back', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Loop animation: 3 seconds per cycle', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy();

  // 创建矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');
  rect.setOrigin(0.5, 0.5);

  // 创建缩放动画
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,        // 缩放到 80%
    scaleY: 0.8,        // 缩放到 80%
    duration: 1500,     // 持续 1.5 秒
    yoyo: true,         // 动画结束后反向播放（恢复到原始大小）
    loop: -1,           // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'  // 使用正弦缓动函数使动画更平滑
  });

  // 添加文字说明
  this.add.text(400, 50, '矩形缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
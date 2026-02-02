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
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectTexture', 150, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');
  rect.setOrigin(0.5, 0.5); // 设置中心点为缩放原点

  // 创建缩放动画
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,      // 缩放到 80%
    scaleY: 0.8,      // 缩放到 80%
    duration: 2500,   // 持续 2.5 秒
    yoyo: true,       // 动画结束后反向播放（恢复原始大小）
    loop: -1,         // 无限循环 (-1 表示永久循环)
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });

  // 添加文字提示
  this.add.text(400, 50, '矩形缩放动画 (循环播放)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '缩放: 100% → 80% → 100% (2.5秒/周期)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectangleTex', 150, 100);
  graphics.destroy();

  // 创建矩形精灵，放置在屏幕中心
  const rectangle = this.add.sprite(400, 300, 'rectangleTex');
  rectangle.setOrigin(0.5, 0.5);

  // 创建缩放动画
  this.tweens.add({
    targets: rectangle,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1250, // 2.5秒的一半，因为 yoyo 会来回播放
    yoyo: true, // 动画结束后反向播放回到原始状态
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });

  // 添加文字说明
  this.add.text(400, 50, '矩形缩放动画 (循环播放)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '缩放: 100% -> 80% -> 100% (2.5秒循环)', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
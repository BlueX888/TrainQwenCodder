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
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy();

  // 创建矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');

  // 创建缩放动画
  // 从原始大小 (scale: 1) 缩放到 48% (scale: 0.48)
  // yoyo: true 表示动画结束后反向播放（恢复到原始大小）
  // duration: 2000 表示单向动画持续 2 秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: rect,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 2000,
    yoyo: true,
    loop: -1,
    ease: 'Linear'
  });

  // 添加提示文本
  this.add.text(400, 500, '矩形循环缩放动画 (48% ↔ 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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

  // 创建矩形精灵并放置在屏幕中央
  const rectangle = this.add.sprite(400, 300, 'rectTexture');

  // 创建缩放动画
  this.tweens.add({
    targets: rectangle,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 500,  // 0.5 秒
    yoyo: true,     // 动画结束后反向播放（恢复原始大小）
    loop: -1,       // 无限循环播放（-1 表示无限循环）
    ease: 'Linear'  // 线性缓动
  });
}

new Phaser.Game(config);
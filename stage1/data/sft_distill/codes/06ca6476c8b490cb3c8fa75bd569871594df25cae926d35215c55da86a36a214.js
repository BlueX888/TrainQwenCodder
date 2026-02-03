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

  // 创建矩形 Sprite
  const rect = this.add.sprite(400, 300, 'rectTexture');
  rect.setOrigin(0.5, 0.5);

  // 创建缩放动画
  this.tweens.add({
    targets: rect,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 3000,        // 3秒缩放到48%
    yoyo: true,            // 动画结束后反向播放（恢复到原始大小）
    loop: -1,              // 无限循环
    ease: 'Linear'         // 线性缓动
  });

  // 添加提示文本
  const text = this.add.text(400, 50, 'Rectangle scaling to 48% in 3s (looping)', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);
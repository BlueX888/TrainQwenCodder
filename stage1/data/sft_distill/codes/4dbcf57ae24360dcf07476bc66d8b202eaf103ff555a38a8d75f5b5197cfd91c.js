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
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('squareTexture', 100, 100);
  graphics.destroy();

  // 创建方块精灵，放置在屏幕中央
  const square = this.add.sprite(400, 300, 'squareTexture');

  // 创建缩放动画
  // 使用 yoyo 实现来回缩放效果
  this.tweens.add({
    targets: square,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 1000,  // 1秒缩小到32%
    yoyo: true,      // 自动反向播放（恢复到原始大小）
    loop: -1,        // -1 表示无限循环
    ease: 'Linear'   // 线性缓动
  });

  // 添加文字提示
  this.add.text(400, 500, '方块循环缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
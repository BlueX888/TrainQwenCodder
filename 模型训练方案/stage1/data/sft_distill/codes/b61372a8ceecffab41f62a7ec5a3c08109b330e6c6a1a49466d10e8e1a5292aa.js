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
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，保留纹理

  // 创建方块精灵并放置在屏幕中央
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);

  // 创建渐变动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: square,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 1500, // 持续 1.5 秒
    ease: 'Linear', // 线性渐变
    yoyo: true, // 来回播放（0->1->0）
    repeat: -1 // 无限循环
  });

  // 添加文本说明
  this.add.text(400, 500, 'Square fading in/out every 1.5s', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
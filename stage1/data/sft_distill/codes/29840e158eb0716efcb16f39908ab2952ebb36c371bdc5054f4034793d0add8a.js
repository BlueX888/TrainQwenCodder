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
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建方块精灵，放置在屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.setAlpha(0);

  // 创建渐变动画：从透明到不透明，3 秒，循环播放
  this.tweens.add({
    targets: square,           // 目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 3000,            // 持续时间 3 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 往返播放（透明->不透明->透明）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });

  // 添加提示文本
  this.add.text(400, 500, 'Square fading in/out every 3 seconds', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
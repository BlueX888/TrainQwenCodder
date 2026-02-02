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
  graphics.destroy(); // 销毁 graphics 对象，节省资源

  // 创建方块精灵，放置在屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  square.setAlpha(0); // 初始设置为完全透明

  // 创建透明度渐变动画
  this.tweens.add({
    targets: square,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 3000, // 持续 3 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 动画结束后反向播放（从 1 回到 0）
    repeat: -1 // 无限循环
  });

  // 添加文本提示
  this.add.text(400, 500, '方块在 3 秒内从透明到不透明循环播放', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
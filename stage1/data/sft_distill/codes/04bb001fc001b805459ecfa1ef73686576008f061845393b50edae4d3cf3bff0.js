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
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建方块精灵并设置初始位置
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为0（完全透明）
  square.setAlpha(0);

  // 创建渐变动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: square,
    alpha: 1, // 目标透明度为1（完全不透明）
    duration: 500, // 持续时间0.5秒（500毫秒）
    ease: 'Linear', // 线性缓动
    yoyo: true, // 来回播放（透明->不透明->透明）
    repeat: -1 // 无限循环
  });

  // 添加提示文本
  this.add.text(400, 500, '方块渐变动画（循环播放）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
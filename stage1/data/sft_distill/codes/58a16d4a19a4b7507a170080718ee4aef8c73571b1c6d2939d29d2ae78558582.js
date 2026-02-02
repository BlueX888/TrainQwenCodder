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

  // 创建方块 Sprite，放置在屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为0（完全透明）
  square.setAlpha(0);

  // 创建透明度渐变动画
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 3000,            // 持续时间3秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用悠悠球效果（到达目标后反向播放）
    repeat: -1                 // 无限循环（-1表示永久重复）
  });

  // 添加提示文本
  this.add.text(400, 500, '方块将在3秒内从透明渐变到不透明，并循环播放', {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
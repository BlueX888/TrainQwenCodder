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
  // 创建 Graphics 对象绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充样式（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制椭圆（中心位置，半径 x, 半径 y）
  graphics.fillEllipse(400, 300, 150, 100);
  
  // 设置初始透明度为 0（完全透明）
  graphics.alpha = 0;
  
  // 创建补间动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 2500,              // 持续时间 2.5 秒
    ease: 'Linear',              // 线性缓动
    repeat: -1,                  // 无限循环
    yoyo: true                   // 来回播放（透明→不透明→透明）
  });
  
  // 添加文本提示
  this.add.text(400, 50, 'Ellipse Fade Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Alpha: 0 → 1 → 0 (2.5s cycle)', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  
  // 设置填充样式为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制椭圆（中心点在画布中央，宽度200，高度120）
  graphics.fillEllipse(400, 300, 200, 120);
  
  // 设置初始透明度为0（完全透明）
  graphics.alpha = 0;
  
  // 创建补间动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度（完全不透明）
    duration: 1000,              // 持续时间1秒（1000毫秒）
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 往返播放（1->0->1）
    repeat: -1                   // 无限循环（-1表示永久重复）
  });
}

// 创建并启动游戏
new Phaser.Game(config);
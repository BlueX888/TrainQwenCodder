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
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在画布中央，宽度 200，高度 120）
  graphics.fillEllipse(400, 300, 200, 120);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画，让椭圆从透明渐变到不透明
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 500,               // 持续时间 0.5 秒（500 毫秒）
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 往返播放（透明 -> 不透明 -> 透明）
    repeat: -1                   // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, '椭圆淡入淡出动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制椭圆（中心位置，水平半径，垂直半径）
  graphics.fillEllipse(400, 300, 150, 100);
  
  // 设置初始透明度为 0（完全透明）
  graphics.alpha = 0;
  
  // 创建 Tween 动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 2000,              // 持续时间 2 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 来回播放（1->0->1）
    repeat: -1                   // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, '椭圆透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
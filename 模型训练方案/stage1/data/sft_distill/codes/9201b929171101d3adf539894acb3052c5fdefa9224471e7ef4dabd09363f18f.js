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
  // 创建青色椭圆
  const ellipse = this.add.graphics();
  ellipse.fillStyle(0x00ffff, 1); // 青色
  ellipse.fillEllipse(0, 0, 150, 100); // 在原点绘制椭圆
  
  // 设置椭圆位置到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: ellipse,
    scaleX: 1.5,  // 水平缩放到 1.5 倍
    scaleY: 1.5,  // 垂直缩放到 1.5 倍
    duration: 2000, // 持续时间 2 秒
    yoyo: true,     // 往返效果（放大后再缩小）
    loop: -1,       // 无限循环 (-1 表示永久循环)
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
}

new Phaser.Game(config);
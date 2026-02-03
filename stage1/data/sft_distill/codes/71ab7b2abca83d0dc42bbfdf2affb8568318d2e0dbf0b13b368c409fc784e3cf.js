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
  // 创建 Graphics 对象绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色
  graphics.fillEllipse(0, 0, 80, 50); // 在原点绘制椭圆，宽80高50
  
  // 将椭圆初始位置设置在左侧
  graphics.x = 100;
  graphics.y = 300;
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: graphics,
    x: 700, // 目标 x 坐标（右侧）
    duration: 2500, // 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达终点后反向播放）
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);
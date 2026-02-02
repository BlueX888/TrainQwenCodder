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
  // 创建黄色椭圆
  const ellipse = this.add.ellipse(100, 300, 80, 50, 0xffff00);
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    x: 700,                     // 目标 x 坐标（右侧）
    duration: 1000,             // 持续时间 1 秒
    yoyo: true,                 // 往返效果（到达终点后反向回到起点）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Linear'              // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Yellow Ellipse Tween Loop', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
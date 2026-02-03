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
  // 创建 Graphics 对象绘制红色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillEllipse(0, 0, 80, 50); // 在原点绘制椭圆，宽80，高50
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('ellipse', 80, 50);
  graphics.destroy(); // 销毁临时 graphics 对象
  
  // 创建使用该纹理的精灵对象
  const ellipse = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（右侧）
    duration: 4000, // 持续时间 4 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返效果（到达目标后反向回到起点）
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
}

// 启动 Phaser 游戏
new Phaser.Game(config);
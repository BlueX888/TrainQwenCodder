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
  // 创建 Graphics 对象绘制粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(0, 0, 80, 50); // 在原点绘制椭圆，宽80高50
  
  // 将 graphics 转换为纹理以便于移动
  graphics.generateTexture('pinkEllipse', 80, 50);
  graphics.destroy(); // 销毁 graphics 对象
  
  // 创建使用该纹理的精灵
  const ellipse = this.add.image(100, 300, 'pinkEllipse');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 持续时间 1 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环 (-1 表示永久重复)
  });
}

new Phaser.Game(config);
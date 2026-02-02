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
  // 无需预加载资源
}

function create() {
  // 创建粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(0, 0, 80, 50); // 在原点绘制椭圆，宽80高50
  
  // 将 graphics 转换为纹理以便于移动
  graphics.generateTexture('ellipse', 80, 50);
  graphics.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 1秒
    yoyo: true, // 启用往返效果
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);
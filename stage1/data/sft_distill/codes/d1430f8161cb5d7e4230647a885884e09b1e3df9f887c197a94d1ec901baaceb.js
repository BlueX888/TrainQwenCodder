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
  // 使用 Graphics 绘制粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(30, 30, 60, 40); // 在中心绘制椭圆
  
  // 生成纹理
  graphics.generateTexture('pinkEllipse', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'pinkEllipse');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标位置（右侧）
    duration: 1000, // 持续时间 1 秒
    yoyo: true, // 往返效果（到达目标后返回起点）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);
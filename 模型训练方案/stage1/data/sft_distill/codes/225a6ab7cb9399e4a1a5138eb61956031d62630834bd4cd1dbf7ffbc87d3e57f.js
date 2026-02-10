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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制椭圆 (x, y, width, height)
  graphics.fillEllipse(40, 30, 80, 60);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
  
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标位置（右侧）
    duration: 2000, // 持续时间 2 秒
    yoyo: true, // 启用往返效果（到达目标后反向回到起点）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);
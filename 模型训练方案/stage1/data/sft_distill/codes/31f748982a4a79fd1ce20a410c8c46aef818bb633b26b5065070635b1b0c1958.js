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
  
  // 绘制椭圆（中心点在 0,0，宽度 80，高度 50）
  graphics.fillEllipse(40, 25, 80, 50);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 50);
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const ellipseSprite = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipseSprite,
    x: 700, // 目标位置（右侧）
    duration: 2500, // 持续时间 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);
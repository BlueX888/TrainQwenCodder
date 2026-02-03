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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆（中心点40,30，宽80，高60）
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象
  const ellipseSprite = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipseSprite,
    x: 700, // 目标 x 坐标（右侧）
    duration: 500, // 持续时间 0.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    loop: -1 // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);
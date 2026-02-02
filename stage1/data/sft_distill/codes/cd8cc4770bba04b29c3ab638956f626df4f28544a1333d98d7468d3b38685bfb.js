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
  // 使用 Graphics 绘制青色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆（中心点，宽度，高度）
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象
  const ellipse = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（从左到右）
    duration: 2500, // 持续时间 2.5 秒
    yoyo: true, // 启用往返效果
    repeat: -1, // 无限循环（-1 表示永久重复）
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);
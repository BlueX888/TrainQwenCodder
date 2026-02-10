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
  
  // 绘制椭圆（中心点在 50, 30，宽度 100，高度 60）
  graphics.fillEllipse(50, 30, 100, 60);
  
  // 生成纹理
  graphics.generateTexture('orangeEllipse', 100, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建 Sprite 对象
  const ellipseSprite = this.add.sprite(100, 300, 'orangeEllipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipseSprite,
    x: 700, // 从左侧 100 移动到右侧 700
    duration: 500, // 持续时间 0.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    loop: -1, // 无限循环（-1 表示永久循环）
    repeat: 0 // yoyo 本身会处理往返，不需要额外的 repeat
  });
}

new Phaser.Game(config);
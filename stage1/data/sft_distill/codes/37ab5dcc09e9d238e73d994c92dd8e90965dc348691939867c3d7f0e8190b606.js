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
  graphics.fillEllipse(40, 30, 80, 60); // 在中心绘制椭圆
  
  // 生成纹理
  graphics.generateTexture('pinkEllipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象
  const ellipseSprite = this.add.sprite(100, 300, 'pinkEllipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipseSprite,
    x: 700, // 移动到右侧
    duration: 1000, // 1秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环 (-1 表示永久循环)
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);
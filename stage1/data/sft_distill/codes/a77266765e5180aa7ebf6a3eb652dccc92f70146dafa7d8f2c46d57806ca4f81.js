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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制椭圆（中心点在 0,0，宽度 80，高度 50）
  graphics.fillEllipse(40, 25, 80, 50);
  
  // 生成纹理
  graphics.generateTexture('orangeEllipse', 80, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'orangeEllipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,
    x: 700, // 移动到右侧
    duration: 500, // 持续 0.5 秒（500 毫秒）
    yoyo: true, // 往返效果
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);
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
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(50, 40, 100, 80); // 绘制椭圆（中心点，宽度，高度）
  
  // 生成纹理
  graphics.generateTexture('orangeEllipse', 100, 80);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象
  const ellipse = this.add.sprite(400, 300, 'orangeEllipse');
  
  // 创建抖动动画效果
  // 抖动效果通过快速来回移动实现
  this.tweens.add({
    targets: ellipse,
    x: '+=10', // 向右移动 10 像素
    duration: 50, // 50 毫秒
    yoyo: true, // 来回运动
    repeat: -1, // 无限重复
    ease: 'Sine.easeInOut'
  });
  
  // 添加垂直抖动增强效果
  this.tweens.add({
    targets: ellipse,
    y: '+=8', // 向下移动 8 像素
    duration: 60, // 60 毫秒
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 添加旋转抖动效果
  this.tweens.add({
    targets: ellipse,
    angle: 5, // 旋转 5 度
    duration: 100,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 创建一个主时间轴控制整体循环（2 秒一个周期）
  // 通过改变抖动强度实现更明显的循环效果
  this.tweens.add({
    targets: ellipse,
    scaleX: 1.05,
    scaleY: 0.95,
    duration: 1000, // 1 秒
    yoyo: true, // 来回
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut'
  });
}

new Phaser.Game(config);
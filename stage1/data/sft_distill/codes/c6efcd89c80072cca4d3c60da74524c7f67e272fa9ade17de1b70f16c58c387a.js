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
  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillEllipse(50, 30, 80, 50); // 在中心绘制椭圆（宽80，高50）
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 60);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建椭圆精灵并放置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 创建旋转动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    angle: 360,                 // 旋转到 360 度
    duration: 500,              // 持续时间 0.5 秒
    repeat: -1,                 // 无限循环 (-1 表示永久重复)
    ease: 'Linear'              // 线性缓动，保持匀速旋转
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Green Ellipse Rotating (0.5s per cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
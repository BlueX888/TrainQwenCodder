const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建绿色椭圆纹理
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制椭圆（中心在纹理中心）
  // fillEllipse(x, y, width, height)
  graphics.fillEllipse(50, 30, 100, 60);
  
  // 生成纹理
  graphics.generateTexture('greenEllipse', 100, 60);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，放置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'greenEllipse');
  
  // 创建旋转动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    angle: 360,                 // 旋转到 360 度
    duration: 500,              // 持续时间 0.5 秒
    repeat: -1,                 // 无限循环（-1 表示永远重复）
    ease: 'Linear'              // 线性缓动，保证匀速旋转
  });
  
  // 添加提示文本
  this.add.text(400, 500, '绿色椭圆旋转动画 (0.5秒/圈)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
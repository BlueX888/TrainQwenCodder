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
  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制椭圆（中心在 0,0，半径 80x50）
  graphics.fillEllipse(0, 0, 160, 100);
  
  // 生成纹理
  graphics.generateTexture('greenEllipse', 160, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象，放置在屏幕中心
  const ellipseSprite = this.add.sprite(400, 300, 'greenEllipse');
  
  // 创建旋转动画
  this.tweens.add({
    targets: ellipseSprite,      // 动画目标
    angle: 360,                   // 旋转到 360 度
    duration: 500,                // 持续时间 0.5 秒
    repeat: -1,                   // 无限循环（-1 表示永久重复）
    ease: 'Linear'                // 线性缓动，保持匀速旋转
  });
}

new Phaser.Game(config);
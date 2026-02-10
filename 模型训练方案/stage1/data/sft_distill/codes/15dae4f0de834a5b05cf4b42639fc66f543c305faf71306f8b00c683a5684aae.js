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
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制椭圆（中心点在 60, 40，半径为 60 和 40）
  graphics.fillEllipse(60, 40, 120, 80);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在屏幕中心创建椭圆精灵
  const ellipseSprite = this.add.sprite(400, 300, 'ellipse');
  
  // 创建旋转动画
  this.tweens.add({
    targets: ellipseSprite,        // 动画目标对象
    angle: 360,                     // 旋转到 360 度
    duration: 2500,                 // 持续时间 2.5 秒
    ease: 'Linear',                 // 线性缓动，保持匀速旋转
    repeat: -1,                     // -1 表示无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免角度累积
      ellipseSprite.angle = 0;
    }
  });
}

new Phaser.Game(config);
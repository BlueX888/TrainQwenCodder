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
  // 使用 Graphics 绘制青色椭圆
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制椭圆（中心点在 0,0，宽度 120，高度 80）
  graphics.fillEllipse(0, 0, 120, 80);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在屏幕中心创建椭圆精灵
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 创建旋转动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    angle: 360,                 // 旋转到 360 度
    duration: 2500,             // 持续时间 2.5 秒
    ease: 'Linear',             // 线性缓动，保持匀速旋转
    repeat: -1,                 // 无限循环 (-1 表示永久循环)
    onRepeat: function() {
      // 每次循环重置角度，避免数值累积
      ellipse.angle = 0;
    }
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '青色椭圆旋转动画\n2.5秒一圈，无限循环', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);
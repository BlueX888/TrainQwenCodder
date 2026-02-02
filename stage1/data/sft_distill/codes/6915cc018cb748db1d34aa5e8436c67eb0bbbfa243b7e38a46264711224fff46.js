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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建绿色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillRect(0, 0, 100, 100); // 绘制100x100的矩形
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('greenRect', 100, 100);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 创建 Sprite 对象并设置到屏幕中心
  const rectangle = this.add.sprite(400, 300, 'greenRect');
  
  // 创建旋转动画
  // 使用 angle 属性从 0 度旋转到 360 度
  this.tweens.add({
    targets: rectangle,
    angle: 360, // 旋转到360度
    duration: 1500, // 持续时间1.5秒
    ease: 'Linear', // 线性缓动，保证匀速旋转
    repeat: -1, // 无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免累积
      rectangle.angle = 0;
    }
  });
  
  // 添加文字说明
  this.add.text(400, 450, 'Green Rectangle Rotation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
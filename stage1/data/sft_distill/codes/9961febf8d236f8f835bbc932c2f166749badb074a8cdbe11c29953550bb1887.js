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
  // 使用 Graphics 绘制紫色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('purpleRect', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象，放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'purpleRect');
  
  // 设置精灵的原点为中心（默认就是中心，但明确设置更清晰）
  rect.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    angle: 360,              // 旋转到 360 度
    duration: 2000,          // 持续时间 2 秒
    ease: 'Linear',          // 线性缓动，保持匀速旋转
    repeat: -1,              // -1 表示无限循环
    onRepeat: function() {
      // 每次循环重置角度，避免角度累积过大
      rect.angle = 0;
    }
  });
  
  // 添加文字说明
  this.add.text(400, 450, '紫色矩形旋转动画 (2秒/圈)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
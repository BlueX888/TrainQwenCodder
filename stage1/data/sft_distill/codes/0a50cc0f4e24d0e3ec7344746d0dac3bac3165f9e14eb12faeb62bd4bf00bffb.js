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
  // 使用 Graphics 绘制绿色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillRect(0, 0, 100, 60); // 绘制矩形
  
  // 生成纹理
  graphics.generateTexture('greenRect', 100, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象，设置在屏幕中央
  const rect = this.add.sprite(400, 300, 'greenRect');
  
  // 设置精灵的原点为中心点，使其围绕中心旋转
  rect.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    angle: 360,              // 旋转到 360 度（完整一圈）
    duration: 1500,          // 持续时间 1.5 秒
    ease: 'Linear',          // 线性缓动，保持匀速旋转
    repeat: -1,              // -1 表示无限循环
    onRepeat: function() {
      // 每次重复时重置角度，避免角度累积
      rect.angle = 0;
    }
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Green Rectangle Rotating (1.5s per cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
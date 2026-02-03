const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建红色六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制六边形
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  
  const hexRadius = 50;
  const centerX = 60;
  const centerY = 60;
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 120, 120);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵并放置在屏幕中心
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建旋转动画
  this.tweens.add({
    targets: hexagon,
    rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
    duration: 4000, // 4 秒完成一次旋转
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1 // 无限循环
  });
  
  // 添加说明文字
  this.add.text(400, 500, '红色六边形旋转动画 (4秒/圈)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
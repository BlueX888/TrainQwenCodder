const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形参数
  const centerX = 50;
  const centerY = 50;
  const radius = 40;
  const sides = 6;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
  
  // 创建六边形精灵并居中显示
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexagon.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexagon,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 500,         // 持续时间 0.5 秒（500 毫秒）
    ease: 'Linear',        // 线性缓动
    yoyo: true,            // 来回播放（透明->不透明->透明）
    repeat: -1             // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, '六边形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
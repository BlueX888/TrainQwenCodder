const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建六边形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制六边形
  const hexRadius = 60;
  const hexagonPath = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexagonPath.push({ x, y });
  }
  
  // 填充六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.beginPath();
  graphics.moveTo(hexagonPath[0].x + hexRadius, hexagonPath[0].y + hexRadius);
  for (let i = 1; i < hexagonPath.length; i++) {
    graphics.lineTo(hexagonPath[i].x + hexRadius, hexagonPath[i].y + hexRadius);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 绘制边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.beginPath();
  graphics.moveTo(hexagonPath[0].x + hexRadius, hexagonPath[0].y + hexRadius);
  for (let i = 1; i < hexagonPath.length; i++) {
    graphics.lineTo(hexagonPath[i].x + hexRadius, hexagonPath[i].y + hexRadius);
  }
  graphics.closePath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵并居中显示
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1500,  // 1.5 秒缩小到 80%
    yoyo: true,      // 自动返回原始值
    repeat: -1,      // 无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Hexagon scaling animation (1.0 ↔ 0.8)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
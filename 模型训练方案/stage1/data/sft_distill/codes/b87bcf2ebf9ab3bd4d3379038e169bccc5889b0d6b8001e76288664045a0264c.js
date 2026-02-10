const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形参数
  const hexRadius = 80;
  const hexCenterX = 100;
  const hexCenterY = 100;
  const sides = 6;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy();
  
  // 创建六边形 Sprite 并放置在屏幕中央
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexagon.setAlpha(0);
  
  // 创建循环渐变动画
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 500, // 持续 0.5 秒
    ease: 'Linear',
    yoyo: true, // 来回循环（透明->不透明->透明）
    repeat: -1 // 无限循环
  });
}

new Phaser.Game(config);
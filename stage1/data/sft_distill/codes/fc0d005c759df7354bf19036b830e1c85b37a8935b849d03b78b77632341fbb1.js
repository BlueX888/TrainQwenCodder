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
  // 使用 Graphics 绘制青色六边形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形（中心点为 64, 64，半径为 50）
  const hexagonRadius = 50;
  const centerX = 64;
  const centerY = 64;
  const sides = 6;
  
  // 开始绘制路径
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = centerX + hexagonRadius * Math.cos(angle);
    const y = centerY + hexagonRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 128, 128);
  graphics.destroy();
  
  // 创建六边形精灵并放置在屏幕中央
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建闪烁动画（通过 alpha 透明度变化）
  this.tweens.add({
    targets: hexagon,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 500,      // 单程持续时间 500ms
    yoyo: true,         // 往返效果（透明后再恢复）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut'  // 使用正弦缓动使闪烁更平滑
  });
}

new Phaser.Game(config);
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
  // 使用 Graphics 绘制青色六边形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形
  const hexRadius = 60;
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  graphics.beginPath();
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
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形 Sprite 并放置在屏幕中央
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建闪烁动画 - 使用 Tween 控制透明度
  this.tweens.add({
    targets: hexagon,
    alpha: 0,              // 目标透明度为 0（完全透明）
    duration: 500,         // 淡出持续 0.5 秒
    yoyo: true,            // 反向播放（淡入）
    repeat: -1,            // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动函数
  });
}

new Phaser.Game(config);
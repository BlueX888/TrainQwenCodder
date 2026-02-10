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
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 50;
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
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
  
  // 创建六边形图像对象，放置在屏幕中心
  const hexagon = this.add.image(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexagon.setAlpha(0);
  
  // 创建循环 Tween 动画：从透明到不透明
  this.tweens.add({
    targets: hexagon,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 500,         // 持续时间 0.5 秒（500 毫秒）
    yoyo: true,            // 反向播放（从 1 回到 0）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
}

new Phaser.Game(config);
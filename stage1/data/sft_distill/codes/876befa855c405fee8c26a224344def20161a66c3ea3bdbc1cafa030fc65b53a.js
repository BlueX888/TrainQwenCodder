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
  // 使用 Graphics 绘制橙色六边形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制六边形（中心点为原点）
  const hexagonRadius = 40;
  const hexagonPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = hexagonRadius * Math.cos(angle);
    const y = hexagonRadius * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制多边形
  graphics.fillPoints(hexagonPoints, true);
  
  // 生成纹理（需要足够大的尺寸来容纳六边形）
  const textureSize = hexagonRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  
  // 清除 graphics 对象
  graphics.destroy();
  
  // 创建精灵对象，设置初始位置在左侧
  const hexagonSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: hexagonSprite,
    x: 700, // 目标位置（右侧）
    duration: 2500, // 2.5秒
    ease: 'Linear', // 线性移动
    yoyo: true, // 往返效果
    loop: -1 // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);
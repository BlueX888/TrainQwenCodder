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
  
  // 绘制六边形（正六边形）
  const hexRadius = 40;
  const hexagonPath = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexagonPath.push(x, y);
  }
  
  graphics.fillPoints(hexagonPath, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵
  const hexSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右移动，然后往返循环
  this.tweens.add({
    targets: hexSprite,
    x: 700, // 目标 x 坐标（右侧）
    duration: 2500, // 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    loop: -1 // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);
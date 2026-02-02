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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色六边形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形
  const hexagonSize = 40;
  const hexagonPoints = [];
  
  // 计算六边形的6个顶点（中心在原点）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = hexagonSize * Math.cos(angle);
    const y = hexagonSize * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制多边形
  graphics.fillPoints(hexagonPoints, true);
  
  // 生成纹理（纹理大小需要足够容纳六边形）
  const textureSize = hexagonSize * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  
  // 清除 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵
  const hexagonSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左移动到右，4秒完成，往返循环
  this.tweens.add({
    targets: hexagonSprite,
    x: 700, // 目标 x 坐标（右侧）
    duration: 4000, // 4秒
    yoyo: true, // 启用往返效果
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);
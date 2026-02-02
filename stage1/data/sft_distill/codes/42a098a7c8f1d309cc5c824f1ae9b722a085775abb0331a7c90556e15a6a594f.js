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
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形的参数
  const hexRadius = 50; // 六边形半径
  const centerX = 100; // 临时中心点（用于生成纹理）
  const centerY = 100;
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff00, 1); // 绿色六边形
  graphics.lineStyle(3, 0xffffff, 1); // 白色边框
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  
  // 清除 graphics 对象（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵，放置在屏幕中央
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为0（完全透明）
  hexSprite.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: hexSprite,           // 动画目标对象
    alpha: 1,                      // 目标透明度值（完全不透明）
    duration: 500,                 // 持续时间 0.5秒 = 500毫秒
    ease: 'Linear',                // 线性缓动
    yoyo: true,                    // 往返播放（1->0->1）
    repeat: -1                     // 无限循环
  });
  
  // 添加说明文字
  this.add.text(400, 500, '六边形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);
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
  
  // 设置六边形参数
  const hexRadius = 80; // 六边形半径
  const centerX = 100; // 绘制中心点
  const centerY = 100;
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff00, 1); // 绿色填充
  graphics.lineStyle(4, 0xffffff, 1); // 白色边框
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算六边形的六个顶点并绘制
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
  graphics.strokePath();
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('hexagon', 200, 200);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexSprite.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexSprite,
    alpha: 1, // 目标透明度：完全不透明
    duration: 1000, // 持续时间：1 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 来回播放（透明->不透明->透明）
    repeat: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, '六边形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
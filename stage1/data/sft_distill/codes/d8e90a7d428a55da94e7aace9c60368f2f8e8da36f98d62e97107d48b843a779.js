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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 计算六边形的顶点坐标
  const hexRadius = 80; // 六边形半径
  const centerX = 100;
  const centerY = 100;
  const points = [];
  
  // 生成六边形的 6 个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 每个角 60 度，起始角度 -90 度
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在屏幕中心创建六边形精灵
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexagon.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 4000, // 持续 4 秒（4000 毫秒）
    ease: 'Linear', // 线性渐变
    yoyo: true, // 来回播放（透明->不透明->透明）
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 500, '六边形透明度循环动画（4秒周期）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  // 使用 Graphics 绘制绿色六边形
  const graphics = this.add.graphics();
  
  // 设置绘制样式
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0x00aa00, 1);
  
  // 绘制六边形（中心点在 50, 50，半径 40）
  const hexRadius = 40;
  const centerX = 50;
  const centerY = 50;
  const sides = 6;
  
  // 计算六边形的顶点
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2; // -PI/2 让顶点朝上
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 绘制多边形
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，初始位置在左侧
  const hexSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右，2.5秒，往返循环
  this.tweens.add({
    targets: hexSprite,
    x: 700, // 移动到右侧
    duration: 2500, // 2.5秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环 (-1 表示永久重复)
  });
  
  // 添加文字提示
  this.add.text(400, 50, '绿色六边形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);
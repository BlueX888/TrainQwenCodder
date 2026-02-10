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
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 50;
  const hexColor = 0xff69b4; // 粉色
  
  // 计算六边形的顶点坐标
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillStyle(hexColor, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建六边形精灵
  const hexagon = this.add.image(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右，4秒，往返循环
  this.tweens.add({
    targets: hexagon,
    x: 700, // 移动到右侧
    duration: 4000, // 4秒
    ease: 'Linear', // 线性移动
    yoyo: true, // 往返效果
    loop: -1 // 无限循环
  });
}

new Phaser.Game(config);
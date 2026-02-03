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
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制六边形
  const hexagonRadius = 40;
  const hexagonCenterX = 50;
  const hexagonCenterY = 50;
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始，每60度一个顶点
    const x = hexagonCenterX + hexagonRadius * Math.cos(angle);
    const y = hexagonCenterY + hexagonRadius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵
  const hexagon = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右移动，然后往返循环
  this.tweens.add({
    targets: hexagon,
    x: 700, // 移动到右侧
    duration: 2500, // 2.5秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性移动
  });
}

// 启动游戏
new Phaser.Game(config);
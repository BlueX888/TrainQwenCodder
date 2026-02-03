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
  // 创建 Graphics 对象绘制青色六边形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形（正六边形，半径为 40）
  const hexRadius = 40;
  const centerX = 50; // 临时中心点，用于生成纹理
  const centerY = 50;
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
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
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建六边形精灵，初始位置在左侧
  const hexagon = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左移动到右，4秒完成，往返循环
  this.tweens.add({
    targets: hexagon,
    x: 700, // 目标 x 坐标（右侧）
    duration: 4000, // 4秒
    yoyo: true, // 启用往返效果（到达目标后反向回到起点）
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '青色六边形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
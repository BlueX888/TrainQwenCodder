const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 六边形参数
  const hexRadius = 32; // 半径32像素，总大小64像素
  const hexCount = 20;
  
  // 创建20个随机位置的白色六边形
  for (let i = 0; i < hexCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置白色描边样式
    graphics.lineStyle(2, 0xffffff, 1);
    
    // 计算六边形的6个顶点（相对于中心点）
    const vertices = [];
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j; // 每个顶点间隔60度
      const vx = hexRadius * Math.cos(angle);
      const vy = hexRadius * Math.sin(angle);
      vertices.push({ x: vx, y: vy });
    }
    
    // 绘制六边形路径
    graphics.beginPath();
    graphics.moveTo(vertices[0].x, vertices[0].y);
    for (let j = 1; j < 6; j++) {
      graphics.lineTo(vertices[j].x, vertices[j].y);
    }
    graphics.closePath();
    graphics.strokePath();
    
    // 设置随机位置（确保六边形完全在画布内）
    const randomX = Phaser.Math.Between(hexRadius, 800 - hexRadius);
    const randomY = Phaser.Math.Between(hexRadius, 600 - hexRadius);
    graphics.setPosition(randomX, randomY);
  }
  
  // 添加提示文本
  this.add.text(10, 10, '20个随机位置的白色六边形', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
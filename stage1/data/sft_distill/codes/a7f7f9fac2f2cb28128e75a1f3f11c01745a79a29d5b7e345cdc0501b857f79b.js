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
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置填充样式为白色
    graphics.fillStyle(0xffffff, 1);
    
    // 计算菱形的四个顶点坐标（以点击位置为中心，边长32像素）
    const centerX = pointer.x;
    const centerY = pointer.y;
    const halfSize = 16; // 32像素菱形的半径
    
    // 菱形的四个顶点：上、右、下、左
    const topPoint = { x: centerX, y: centerY - halfSize };
    const rightPoint = { x: centerX + halfSize, y: centerY };
    const bottomPoint = { x: centerX, y: centerY + halfSize };
    const leftPoint = { x: centerX - halfSize, y: centerY };
    
    // 开始绘制路径
    graphics.beginPath();
    graphics.moveTo(topPoint.x, topPoint.y);
    graphics.lineTo(rightPoint.x, rightPoint.y);
    graphics.lineTo(bottomPoint.x, bottomPoint.y);
    graphics.lineTo(leftPoint.x, leftPoint.y);
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a white diamond', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
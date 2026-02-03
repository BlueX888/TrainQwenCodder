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
    
    // 设置填充颜色为白色
    graphics.fillStyle(0xffffff, 1);
    
    // 计算菱形的四个顶点坐标
    // 菱形尺寸为48像素，即从中心到各顶点距离为24像素
    const centerX = pointer.x;
    const centerY = pointer.y;
    const halfSize = 24;
    
    // 菱形四个顶点：上、右、下、左
    const points = [
      centerX, centerY - halfSize,  // 上顶点
      centerX + halfSize, centerY,  // 右顶点
      centerX, centerY + halfSize,  // 下顶点
      centerX - halfSize, centerY   // 左顶点
    ];
    
    // 绘制填充的菱形
    graphics.fillPoints(points, true);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a white diamond', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
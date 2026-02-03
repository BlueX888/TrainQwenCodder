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
    
    // 定义菱形的四个顶点（相对于中心点）
    // 菱形边长32像素，所以从中心到顶点距离为16像素
    const size = 16; // 半径
    const points = [
      { x: pointer.x, y: pointer.y - size },      // 上顶点
      { x: pointer.x + size, y: pointer.y },      // 右顶点
      { x: pointer.x, y: pointer.y + size },      // 下顶点
      { x: pointer.x - size, y: pointer.y }       // 左顶点
    ];
    
    // 开始绘制路径
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    graphics.lineTo(points[1].x, points[1].y);
    graphics.lineTo(points[2].x, points[2].y);
    graphics.lineTo(points[3].x, points[3].y);
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create white diamonds', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
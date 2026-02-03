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
  // 创建 Graphics 对象用于绘制三角形
  const graphics = this.add.graphics();
  
  // 设置绿色填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 三角形的大小（边长）
  const triangleSize = 32;
  
  // 计算等边三角形的高度
  const height = (Math.sqrt(3) / 2) * triangleSize;
  
  // 绘制20个随机位置的三角形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置，确保三角形完全在画布内
    const x = Phaser.Math.Between(triangleSize, config.width - triangleSize);
    const y = Phaser.Math.Between(triangleSize, config.height - triangleSize);
    
    // 计算等边三角形的三个顶点坐标（顶点朝上）
    const x1 = x;                           // 顶点
    const y1 = y - height / 2;
    
    const x2 = x - triangleSize / 2;        // 左下角
    const y2 = y + height / 2;
    
    const x3 = x + triangleSize / 2;        // 右下角
    const y3 = y + height / 2;
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  }
}

// 启动游戏
new Phaser.Game(config);
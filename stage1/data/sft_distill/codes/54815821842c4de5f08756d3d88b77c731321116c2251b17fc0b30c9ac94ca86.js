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
  // 监听画布的点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制三角形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为红色
    graphics.fillStyle(0xff0000, 1);
    
    // 计算三角形的三个顶点坐标
    // 以点击点为中心，绘制一个等边三角形，边长48像素
    const size = 48;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形的高
    
    // 三个顶点坐标（相对于点击点）
    const x1 = pointer.x; // 顶部顶点 x
    const y1 = pointer.y - (height * 2 / 3); // 顶部顶点 y（重心向上偏移）
    
    const x2 = pointer.x - size / 2; // 左下顶点 x
    const y2 = pointer.y + (height / 3); // 左下顶点 y
    
    const x3 = pointer.x + size / 2; // 右下顶点 x
    const y3 = pointer.y + (height / 3); // 右下顶点 y
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成红色三角形', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);
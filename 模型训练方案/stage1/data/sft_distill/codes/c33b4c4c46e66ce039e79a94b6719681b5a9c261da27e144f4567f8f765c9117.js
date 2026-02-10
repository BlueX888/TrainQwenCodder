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
    // 创建 Graphics 对象用于绘制三角形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为红色
    graphics.fillStyle(0xff0000, 1);
    
    // 计算等边三角形的顶点坐标（边长24像素）
    // 三角形中心在点击位置，顶点朝上
    const size = 24;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    const centerX = pointer.x;
    const centerY = pointer.y;
    
    // 三角形三个顶点坐标（顶点朝上，中心在点击位置）
    const x1 = centerX; // 顶点
    const y1 = centerY - (height * 2 / 3);
    
    const x2 = centerX - size / 2; // 左下顶点
    const y2 = centerY + (height / 3);
    
    const x3 = centerX + size / 2; // 右下顶点
    const y3 = centerY + (height / 3);
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(400, 300, '点击画布任意位置生成红色三角形', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);
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
    
    // 计算三角形的三个顶点坐标
    // 以点击点为中心，绘制一个正三角形，边长48像素
    const size = 48;
    const height = size * Math.sqrt(3) / 2; // 正三角形高度
    
    // 三个顶点坐标（相对于点击点）
    const x1 = pointer.x; // 顶点（上）
    const y1 = pointer.y - height * 2 / 3;
    
    const x2 = pointer.x - size / 2; // 左下顶点
    const y2 = pointer.y + height / 3;
    
    const x3 = pointer.x + size / 2; // 右下顶点
    const y3 = pointer.y + height / 3;
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create red triangles', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
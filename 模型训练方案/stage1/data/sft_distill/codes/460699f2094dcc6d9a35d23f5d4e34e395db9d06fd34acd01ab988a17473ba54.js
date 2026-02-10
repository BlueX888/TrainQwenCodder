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
    
    // 设置填充颜色为黄色
    graphics.fillStyle(0xffff00, 1);
    
    // 计算三角形的三个顶点坐标
    // 以点击点为中心，绘制一个等边三角形
    const size = 24;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    // 三个顶点：顶部中心、左下、右下
    const x1 = pointer.x;
    const y1 = pointer.y - height * 2 / 3; // 顶点
    
    const x2 = pointer.x - size / 2;
    const y2 = pointer.y + height / 3; // 左下
    
    const x3 = pointer.x + size / 2;
    const y3 = pointer.y + height / 3; // 右下
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Click anywhere to create yellow triangles', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
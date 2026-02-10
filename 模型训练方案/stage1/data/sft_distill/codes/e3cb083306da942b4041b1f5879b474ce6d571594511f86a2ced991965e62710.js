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
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制三角形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 计算三角形的三个顶点坐标
    // 以点击位置为中心，绘制等边三角形，边长64像素
    const size = 64;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    
    // 三个顶点坐标（相对于点击位置）
    const x1 = pointer.x; // 顶部顶点 x
    const y1 = pointer.y - (height * 2 / 3); // 顶部顶点 y
    
    const x2 = pointer.x - size / 2; // 左下顶点 x
    const y2 = pointer.y + (height / 3); // 左下顶点 y
    
    const x3 = pointer.x + size / 2; // 右下顶点 x
    const y3 = pointer.y + (height / 3); // 右下顶点 y
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    console.log(`创建三角形于位置: (${pointer.x}, ${pointer.y})`);
  });
  
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成绿色三角形', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
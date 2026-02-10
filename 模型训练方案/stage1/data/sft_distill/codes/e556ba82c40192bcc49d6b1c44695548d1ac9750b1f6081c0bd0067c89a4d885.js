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
    
    // 计算等边三角形的顶点坐标
    // 三角形边长为24像素，高度约为 24 * √3/2 ≈ 20.78
    const size = 24;
    const height = size * Math.sqrt(3) / 2;
    
    // 三角形顶点相对于中心点的坐标
    // 顶点1（顶部）
    const x1 = pointer.x;
    const y1 = pointer.y - height * 2 / 3;
    
    // 顶点2（左下）
    const x2 = pointer.x - size / 2;
    const y2 = pointer.y + height / 3;
    
    // 顶点3（右下）
    const x3 = pointer.x + size / 2;
    const y3 = pointer.y + height / 3;
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成红色三角形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
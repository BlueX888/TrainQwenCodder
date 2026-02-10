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
    // 获取点击位置
    const x = pointer.x;
    const y = pointer.y;
    
    // 创建 Graphics 对象绘制菱形
    const graphics = this.add.graphics();
    
    // 设置青色填充
    graphics.fillStyle(0x00ffff, 1);
    
    // 定义菱形的四个顶点（边长80像素）
    // 菱形中心在点击位置，对角线长度为80像素
    const size = 40; // 从中心到顶点的距离
    const diamond = [
      x, y - size,      // 上顶点
      x + size, y,      // 右顶点
      x, y + size,      // 下顶点
      x - size, y       // 左顶点
    ];
    
    // 绘制填充的菱形
    graphics.fillPoints(diamond, true);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a cyan diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
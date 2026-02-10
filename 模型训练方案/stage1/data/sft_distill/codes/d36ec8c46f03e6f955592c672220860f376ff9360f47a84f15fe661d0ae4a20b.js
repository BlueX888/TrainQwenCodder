const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为青色
    graphics.fillStyle(0x00ffff, 1);
    
    // 定义菱形的四个顶点（相对于中心点）
    // 菱形大小为 80 像素，即从中心到边缘的距离为 40 像素
    const size = 40;
    const diamond = new Phaser.Geom.Polygon([
      0, -size,      // 上顶点
      size, 0,       // 右顶点
      0, size,       // 下顶点
      -size, 0       // 左顶点
    ]);
    
    // 将 Graphics 对象移动到点击位置
    graphics.setPosition(pointer.x, pointer.y);
    
    // 填充菱形路径
    graphics.fillPoints(diamond.points, true);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create cyan diamonds', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
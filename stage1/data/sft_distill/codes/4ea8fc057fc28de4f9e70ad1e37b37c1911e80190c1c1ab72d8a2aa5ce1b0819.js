const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9932cc, 1); // 紫色
    
    // 定义菱形的4个顶点（相对于中心点的偏移）
    // 菱形边长为16像素，从中心点到各顶点的距离为8像素
    const diamond = [
      { x: pointer.x, y: pointer.y - 8 },      // 上顶点
      { x: pointer.x + 8, y: pointer.y },      // 右顶点
      { x: pointer.x, y: pointer.y + 8 },      // 下顶点
      { x: pointer.x - 8, y: pointer.y }       // 左顶点
    ];
    
    // 绘制填充的菱形
    graphics.fillPoints(diamond, true);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create purple diamonds', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
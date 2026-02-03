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
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9932cc, 1); // 紫色
    
    // 计算菱形的四个顶点坐标（16像素大小）
    const size = 16;
    const halfSize = size / 2;
    
    // 菱形顶点：上、右、下、左
    const points = [
      { x: pointer.x, y: pointer.y - halfSize },           // 上顶点
      { x: pointer.x + halfSize, y: pointer.y },           // 右顶点
      { x: pointer.x, y: pointer.y + halfSize },           // 下顶点
      { x: pointer.x - halfSize, y: pointer.y }            // 左顶点
    ];
    
    // 绘制填充的菱形
    graphics.fillPoints(points, true);
    
    // 可选：添加控制台日志
    console.log(`菱形已生成在位置: (${pointer.x}, ${pointer.y})`);
  });
  
  // 添加提示文本
  this.add.text(10, 10, '点击画布任意位置生成紫色菱形', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
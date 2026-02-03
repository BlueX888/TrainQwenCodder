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
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为红色
    graphics.fillStyle(0xff0000, 1);
    
    // 获取点击位置
    const x = pointer.x;
    const y = pointer.y;
    
    // 菱形尺寸（从中心到顶点的距离）
    const size = 40; // 80像素菱形，半径为40
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 定义菱形的四个顶点（上、右、下、左）
    graphics.moveTo(x, y - size);        // 上顶点
    graphics.lineTo(x + size, y);        // 右顶点
    graphics.lineTo(x, y + size);        // 下顶点
    graphics.lineTo(x - size, y);        // 左顶点
    
    // 闭合路径并填充
    graphics.closePath();
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create red diamonds', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
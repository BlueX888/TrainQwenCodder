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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置黄色填充样式（0xFFFF00 为黄色，1 为完全不透明）
  graphics.fillStyle(0xFFFF00, 1);
  
  // 绘制 20 个随机位置的圆形
  for (let i = 0; i < 20; i++) {
    // 生成随机 x 坐标（留出圆形半径的边距）
    const x = Math.random() * (this.scale.width - 48) + 24;
    
    // 生成随机 y 坐标（留出圆形半径的边距）
    const y = Math.random() * (this.scale.height - 48) + 24;
    
    // 绘制圆形，半径为 12 像素（直径 24 像素）
    graphics.fillCircle(x, y, 12);
  }
}

// 启动游戏
new Phaser.Game(config);
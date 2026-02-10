const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制圆形
  const graphics = this.add.graphics();
  
  // 设置黄色填充样式
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制20个随机位置的圆形
  for (let i = 0; i < 20; i++) {
    // 生成随机坐标
    // 确保圆形完全在画布内（留出半径12的边距）
    const x = Math.random() * (config.width - 24) + 12;
    const y = Math.random() * (config.height - 24) + 12;
    
    // 绘制圆形，半径为12（直径24像素）
    graphics.fillCircle(x, y, 12);
  }
}

// 启动游戏
new Phaser.Game(config);
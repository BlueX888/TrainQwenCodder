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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 圆形半径（直径48，半径24）
  const radius = 24;
  
  // 绘制5个随机位置的粉色圆形
  for (let i = 0; i < 5; i++) {
    // 生成随机坐标，确保圆形完全在画布内
    const x = Phaser.Math.Between(radius, config.width - radius);
    const y = Phaser.Math.Between(radius, config.height - radius);
    
    // 绘制圆形
    graphics.fillCircle(x, y, radius);
  }
}

// 启动游戏
new Phaser.Game(config);
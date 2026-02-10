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
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 矩形大小
  const rectSize = 48;
  
  // 绘制15个随机位置的绿色矩形
  for (let i = 0; i < 15; i++) {
    // 生成随机位置，确保矩形完全在画布内
    const x = Phaser.Math.Between(0, config.width - rectSize);
    const y = Phaser.Math.Between(0, config.height - rectSize);
    
    // 绘制矩形
    graphics.fillRect(x, y, rectSize, rectSize);
  }
}

// 启动游戏
new Phaser.Game(config);
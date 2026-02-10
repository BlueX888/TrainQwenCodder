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
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 矩形大小
  const rectSize = 32;
  
  // 绘制8个随机位置的红色矩形
  for (let i = 0; i < 8; i++) {
    // 生成随机坐标，确保矩形完全在画布内
    // x 范围: 0 到 (width - rectSize)
    // y 范围: 0 到 (height - rectSize)
    const x = Math.random() * (config.width - rectSize);
    const y = Math.random() * (config.height - rectSize);
    
    // 绘制矩形
    graphics.fillRect(x, y, rectSize, rectSize);
  }
}

// 创建游戏实例
new Phaser.Game(config);
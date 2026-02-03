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
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置紫色填充样式
  graphics.fillStyle(0x800080, 1);
  
  // 方块大小
  const blockSize = 64;
  
  // 绘制10个随机位置的紫色方块
  for (let i = 0; i < 10; i++) {
    // 生成随机位置，确保方块完全在画布内
    const x = Math.random() * (config.width - blockSize);
    const y = Math.random() * (config.height - blockSize);
    
    // 绘制方块
    graphics.fillRect(x, y, blockSize, blockSize);
  }
}

// 创建游戏实例
new Phaser.Game(config);
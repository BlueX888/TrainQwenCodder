// 完整的 Phaser3 代码 - 绘制粉色矩形
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
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为粉色 (RGB: 255, 105, 180)
  graphics.fillStyle(0xff69b4, 1);
  
  // 计算画布中央位置，使矩形居中
  // 画布宽度: 800, 高度: 600
  // 矩形大小: 32x32
  // 中心位置: (800/2 - 32/2, 600/2 - 32/2) = (384, 284)
  const centerX = config.width / 2 - 16;
  const centerY = config.height / 2 - 16;
  
  // 绘制 32x32 的粉色矩形
  graphics.fillRect(centerX, centerY, 32, 32);
}

// 启动 Phaser 游戏
new Phaser.Game(config);
// 完整的 Phaser3 代码 - 在画布中央绘制绿色矩形
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
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置绿色填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算矩形左上角位置，使其在画布中央
  // 矩形大小为 80x80
  const rectSize = 80;
  const centerX = config.width / 2 - rectSize / 2;  // 400 - 40 = 360
  const centerY = config.height / 2 - rectSize / 2; // 300 - 40 = 260
  
  // 在中央绘制 80x80 的绿色矩形
  graphics.fillRect(centerX, centerY, rectSize, rectSize);
}

// 启动 Phaser 游戏
new Phaser.Game(config);
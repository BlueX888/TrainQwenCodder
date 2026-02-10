// 完整的 Phaser3 代码
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
  // 本示例不需要预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充样式为绿色 (0x00ff00)，不透明度为 1
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算矩形左上角坐标，使矩形中心位于画布中心
  // 画布中心: (400, 300)
  // 矩形大小: 80x80
  // 左上角坐标: (400 - 40, 300 - 40) = (360, 260)
  const rectSize = 80;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const rectX = centerX - rectSize / 2;
  const rectY = centerY - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

// 创建游戏实例
new Phaser.Game(config);
// 完整的 Phaser3 代码 - 在画布中央绘制粉色矩形
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
  
  // 设置粉色填充样式（使用常见的粉色色值）
  graphics.fillStyle(0xff69b4, 1);
  
  // 计算矩形左上角位置，使其在画布中央
  // 画布中心：(400, 300)
  // 矩形大小：32x32
  // 左上角坐标：(400 - 16, 300 - 16) = (384, 284)
  const rectX = 384;
  const rectY = 284;
  const rectWidth = 32;
  const rectHeight = 32;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectWidth, rectHeight);
}

// 启动游戏
new Phaser.Game(config);
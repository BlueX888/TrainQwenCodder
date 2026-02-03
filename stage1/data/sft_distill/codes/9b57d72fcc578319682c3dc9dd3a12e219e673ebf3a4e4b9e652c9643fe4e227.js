// Phaser3 游戏配置
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

// 预加载函数
function preload() {
  // 本示例不需要加载外部资源
}

// 创建函数
function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 计算矩形左上角坐标，使其在画布中央
  // 画布宽度: 800, 高度: 600
  // 矩形大小: 24x24
  // 中心点: (800/2, 600/2) = (400, 300)
  // 左上角: (400 - 24/2, 300 - 24/2) = (388, 288)
  const rectSize = 24;
  const x = (config.width / 2) - (rectSize / 2);
  const y = (config.height / 2) - (rectSize / 2);
  
  // 绘制矩形
  graphics.fillRect(x, y, rectSize, rectSize);
}

// 启动游戏
new Phaser.Game(config);
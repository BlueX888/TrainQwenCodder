// 完整的 Phaser3 代码 - 绘制紫色圆形
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
  
  // 设置填充颜色为紫色
  graphics.fillStyle(0x800080, 1);
  
  // 在画布中央绘制圆形
  // 参数：x坐标, y坐标, 半径
  // 直径24像素，半径为12像素
  const centerX = config.width / 2;  // 400
  const centerY = config.height / 2; // 300
  const radius = 12;
  
  graphics.fillCircle(centerX, centerY, radius);
}

// 启动游戏
new Phaser.Game(config);
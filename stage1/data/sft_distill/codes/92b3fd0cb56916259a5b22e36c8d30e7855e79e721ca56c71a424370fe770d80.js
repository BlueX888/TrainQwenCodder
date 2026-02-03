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

/**
 * 预加载资源
 * 本示例不需要加载外部资源
 */
function preload() {
  // 无需加载外部资源
}

/**
 * 创建游戏对象
 * 在画布中央绘制红色圆形
 */
function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色 (0xff0000)，透明度为 1
  graphics.fillStyle(0xff0000, 1);
  
  // 在画布中央绘制圆形
  // 参数：x坐标, y坐标, 半径
  // 画布尺寸 800x600，中心点为 (400, 300)
  // 直径 16 像素，半径为 8 像素
  graphics.fillCircle(400, 300, 8);
}

// 创建并启动 Phaser 游戏实例
new Phaser.Game(config);
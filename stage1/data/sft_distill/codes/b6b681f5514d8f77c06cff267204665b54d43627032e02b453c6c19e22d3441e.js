// 完整的 Phaser3 代码 - 绘制橙色椭圆
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
  
  // 设置填充颜色为橙色
  graphics.fillStyle(0xFFA500, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆的中心点坐标
  // width 和 height 是椭圆的宽度和高度
  graphics.fillEllipse(400, 300, 80, 80);
}

// 启动 Phaser 游戏
new Phaser.Game(config);
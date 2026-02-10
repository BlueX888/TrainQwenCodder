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
  
  // 设置填充颜色为红色 (0xff0000)，透明度为 1
  graphics.fillStyle(0xff0000, 1);
  
  // 在画布中央 (400, 300) 绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆中心点坐标
  // width 和 height 是椭圆的宽度和高度
  graphics.fillEllipse(400, 300, 16, 16);
}

// 创建游戏实例
new Phaser.Game(config);
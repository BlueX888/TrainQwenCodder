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
  
  // 设置填充颜色为绿色 (0x00ff00)，透明度为 1（完全不透明）
  graphics.fillStyle(0x00ff00, 1);
  
  // 在画布中央绘制圆形
  // 参数：x坐标, y坐标, 半径
  // 画布中央坐标为 (400, 300)，半径为 32 像素（直径 64 像素）
  graphics.fillCircle(400, 300, 32);
}

// 启动游戏
new Phaser.Game(config);
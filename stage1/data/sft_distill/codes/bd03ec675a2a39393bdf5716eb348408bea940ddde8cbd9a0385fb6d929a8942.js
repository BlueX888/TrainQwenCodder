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
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 在画布中央绘制圆形
  // 参数：x坐标, y坐标, 半径
  // 画布中心：(800/2, 600/2) = (400, 300)
  // 直径24像素，半径为12像素
  graphics.fillCircle(400, 300, 12);
}

new Phaser.Game(config);
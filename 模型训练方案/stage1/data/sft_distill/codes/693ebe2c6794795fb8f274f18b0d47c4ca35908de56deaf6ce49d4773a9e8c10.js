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
  
  // 设置填充样式为红色，完全不透明
  graphics.fillStyle(0xff0000, 1);
  
  // 在画布中央绘制圆形
  // 参数：x坐标, y坐标, 半径
  graphics.fillCircle(400, 300, 16);
}

new Phaser.Game(config);
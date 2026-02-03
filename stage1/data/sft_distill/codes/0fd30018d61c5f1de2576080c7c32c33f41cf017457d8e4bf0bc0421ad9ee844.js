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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 在画布中央绘制圆形
  // 画布尺寸为 800x600，中心点为 (400, 300)
  // 圆形大小为 24 像素，半径为 12
  graphics.fillCircle(400, 300, 12);
}

new Phaser.Game(config);
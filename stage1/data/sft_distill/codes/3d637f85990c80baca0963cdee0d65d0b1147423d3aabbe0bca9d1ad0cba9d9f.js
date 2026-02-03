const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  graphics.fillStyle(0xff69b4, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // 中心点：(400, 300)，宽度和高度均为 24 像素
  graphics.fillEllipse(400, 300, 24, 24);
}

new Phaser.Game(config);
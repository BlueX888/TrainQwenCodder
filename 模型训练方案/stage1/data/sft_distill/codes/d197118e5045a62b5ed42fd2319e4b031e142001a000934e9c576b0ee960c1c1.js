const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#282c34'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  // 粉色色值：0xFFC0CB (RGB: 255, 192, 203)
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // 中心点：(400, 300)，宽度和高度都设为 24 像素
  graphics.fillEllipse(400, 300, 24, 24);
}

new Phaser.Game(config);
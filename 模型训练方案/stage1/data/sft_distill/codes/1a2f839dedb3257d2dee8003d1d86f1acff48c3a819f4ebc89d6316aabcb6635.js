const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆中心点坐标
  // width 和 height 是椭圆的宽度和高度
  graphics.fillEllipse(400, 300, 24, 24);
}

new Phaser.Game(config);
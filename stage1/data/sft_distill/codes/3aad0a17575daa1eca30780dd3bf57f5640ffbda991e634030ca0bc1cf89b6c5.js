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
  
  // 设置粉色填充样式
  graphics.fillStyle(0xff69b4, 1);
  
  // 在画布中央绘制圆形
  // 圆心位置：(400, 300) - 画布中央
  // 半径：16 像素（直径约 32 像素）
  graphics.fillCircle(400, 300, 16);
}

new Phaser.Game(config);
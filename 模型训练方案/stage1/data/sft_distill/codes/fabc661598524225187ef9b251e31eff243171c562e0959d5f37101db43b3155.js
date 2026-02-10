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
  
  // 计算中央位置
  // 矩形左上角坐标 = (画布中心 - 矩形大小的一半)
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const rectSize = 24;
  const rectX = centerX - rectSize / 2;
  const rectY = centerY - rectSize / 2;
  
  // 在中央绘制 24x24 的黄色矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

new Phaser.Game(config);
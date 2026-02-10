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
  // 本示例不需要预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为粉色
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 在画布中央绘制圆形
  // 参数：x坐标, y坐标, 半径
  // 画布尺寸 800x600，中心点为 (400, 300)
  // 大小约32像素，使用半径16
  graphics.fillCircle(400, 300, 16);
}

new Phaser.Game(config);
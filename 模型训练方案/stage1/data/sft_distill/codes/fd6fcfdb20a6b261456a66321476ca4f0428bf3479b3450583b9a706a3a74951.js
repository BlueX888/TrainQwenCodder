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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 圆形半径（直径24像素，半径12像素）
  const radius = 12;
  
  // 绘制20个随机位置的圆形
  for (let i = 0; i < 20; i++) {
    // 生成随机坐标，确保圆形完全在画布内
    const x = Phaser.Math.Between(radius, config.width - radius);
    const y = Phaser.Math.Between(radius, config.height - radius);
    
    // 绘制圆形
    graphics.fillCircle(x, y, radius);
  }
}

new Phaser.Game(config);
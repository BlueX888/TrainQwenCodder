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
  
  // 设置填充颜色为青色
  graphics.fillStyle(0x00ffff, 1);
  
  // 计算中央位置
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const rectSize = 24;
  
  // 绘制矩形，使其中心位于画布中央
  // 需要将左上角坐标向左上偏移矩形大小的一半
  graphics.fillRect(
    centerX - rectSize / 2,
    centerY - rectSize / 2,
    rectSize,
    rectSize
  );
}

new Phaser.Game(config);
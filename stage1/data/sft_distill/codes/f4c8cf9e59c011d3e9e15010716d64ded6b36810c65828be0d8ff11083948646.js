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
  
  // 设置填充颜色为粉色
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 计算画布中心位置
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 矩形大小
  const rectSize = 32;
  
  // 在中心位置绘制矩形（需要减去一半大小使其居中）
  graphics.fillRect(
    centerX - rectSize / 2,
    centerY - rectSize / 2,
    rectSize,
    rectSize
  );
}

new Phaser.Game(config);
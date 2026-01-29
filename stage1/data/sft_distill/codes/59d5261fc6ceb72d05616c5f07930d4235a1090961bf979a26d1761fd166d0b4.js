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
  
  // 设置填充颜色为绿色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算画布中心点
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 矩形大小
  const rectSize = 80;
  
  // 在中心点绘制矩形（需要减去矩形大小的一半，使矩形中心对齐画布中心）
  graphics.fillRect(
    centerX - rectSize / 2,
    centerY - rectSize / 2,
    rectSize,
    rectSize
  );
}

// 创建游戏实例
new Phaser.Game(config);
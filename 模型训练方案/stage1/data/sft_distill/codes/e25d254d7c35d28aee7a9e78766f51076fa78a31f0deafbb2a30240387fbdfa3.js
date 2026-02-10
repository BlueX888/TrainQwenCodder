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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 计算画布中央位置
  // 画布宽度 800，高度 600
  // 矩形大小 64x64
  // 中心点：(800/2 - 64/2, 600/2 - 64/2) = (368, 268)
  const centerX = this.scale.width / 2 - 32;
  const centerY = this.scale.height / 2 - 32;
  
  // 绘制矩形
  graphics.fillRect(centerX, centerY, 64, 64);
}

new Phaser.Game(config);
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
  // 创建 Graphics 对象用于绘制方块
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制8个随机位置的方块
  for (let i = 0; i < 8; i++) {
    // 生成随机位置，确保方块完全在画布内
    // x 范围: 0 到 (800 - 24)
    // y 范围: 0 到 (600 - 24)
    const x = Phaser.Math.Between(0, 776);
    const y = Phaser.Math.Between(0, 576);
    
    // 绘制 24x24 的方块
    graphics.fillRect(x, y, 24, 24);
  }
}

new Phaser.Game(config);
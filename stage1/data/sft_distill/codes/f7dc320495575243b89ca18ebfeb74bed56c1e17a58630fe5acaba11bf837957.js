// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为橙色 (0xFFA500)
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制20个随机位置的矩形
  for (let i = 0; i < 20; i++) {
    // 生成随机 x 坐标 (0 到 width-80，确保矩形不超出画布)
    const x = Phaser.Math.Between(0, this.scale.width - 80);
    
    // 生成随机 y 坐标 (0 到 height-80，确保矩形不超出画布)
    const y = Phaser.Math.Between(0, this.scale.height - 80);
    
    // 绘制 80x80 的矩形
    graphics.fillRect(x, y, 80, 80);
  }
}

// 启动游戏
new Phaser.Game(config);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置青色填充样式 (cyan)
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制3个随机位置的圆形
  for (let i = 0; i < 3; i++) {
    // 生成随机位置，确保圆形完全在画布内
    // 圆形半径为 40 (直径 80)，所以坐标范围是 [40, width-40] 和 [40, height-40]
    const x = Phaser.Math.Between(40, 760);
    const y = Phaser.Math.Between(40, 560);
    const radius = 40; // 大小为 80 像素，半径为 40
    
    // 绘制圆形
    graphics.fillCircle(x, y, radius);
  }
}

new Phaser.Game(config);
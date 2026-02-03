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
  // 绘制20个随机位置的灰色菱形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置灰色填充
    graphics.fillStyle(0x808080, 1);
    
    // 生成随机位置（确保菱形完全在画布内）
    const x = Phaser.Math.Between(40, 760);
    const y = Phaser.Math.Between(40, 560);
    
    // 菱形大小为80像素，半径为40
    const size = 40;
    
    // 绘制菱形路径
    graphics.beginPath();
    graphics.moveTo(x, y - size);      // 上顶点
    graphics.lineTo(x + size, y);      // 右顶点
    graphics.lineTo(x, y + size);      // 下顶点
    graphics.lineTo(x - size, y);      // 左顶点
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
  }
}

new Phaser.Game(config);
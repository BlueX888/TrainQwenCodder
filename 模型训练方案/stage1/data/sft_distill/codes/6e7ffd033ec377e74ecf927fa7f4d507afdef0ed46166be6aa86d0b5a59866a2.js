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
  // 绘制8个随机位置的红色菱形
  for (let i = 0; i < 8; i++) {
    const graphics = this.add.graphics();
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制菱形（16像素大小）
    // 菱形中心点为 (0, 0)，四个顶点分别在上下左右
    const size = 8; // 半径为8，总大小为16
    graphics.beginPath();
    graphics.moveTo(0, -size);      // 上顶点
    graphics.lineTo(size, 0);       // 右顶点
    graphics.lineTo(0, size);       // 下顶点
    graphics.lineTo(-size, 0);      // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（确保菱形完全在画布内）
    const x = Phaser.Math.Between(size, 800 - size);
    const y = Phaser.Math.Between(size, 600 - size);
    graphics.setPosition(x, y);
  }
}

new Phaser.Game(config);
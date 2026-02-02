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
  const diamondSize = 48; // 菱形大小
  const halfSize = diamondSize / 2; // 半径
  const pinkColor = 0xff69b4; // 粉色
  
  // 绘制8个随机位置的粉色菱形
  for (let i = 0; i < 8; i++) {
    // 生成随机位置（确保菱形完全在画布内）
    const x = Phaser.Math.Between(halfSize, config.width - halfSize);
    const y = Phaser.Math.Between(halfSize, config.height - halfSize);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为粉色
    graphics.fillStyle(pinkColor, 1);
    
    // 绘制菱形路径
    graphics.beginPath();
    graphics.moveTo(x, y - halfSize);           // 上顶点
    graphics.lineTo(x + halfSize, y);           // 右顶点
    graphics.lineTo(x, y + halfSize);           // 下顶点
    graphics.lineTo(x - halfSize, y);           // 左顶点
    graphics.closePath();                       // 闭合路径
    
    // 填充菱形
    graphics.fillPath();
  }
}

new Phaser.Game(config);
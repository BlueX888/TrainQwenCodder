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
  // 创建12个随机位置的绿色六边形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 六边形的半径（大小16像素，半径为8）
    const radius = 8;
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 计算六边形的6个顶点
    for (let j = 0; j < 6; j++) {
      // 六边形每个角度间隔60度（PI/3弧度）
      const angle = (Math.PI / 3) * j;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    // 闭合路径
    graphics.closePath();
    
    // 填充路径
    graphics.fillPath();
    
    // 设置随机位置
    const randomX = Phaser.Math.Between(20, 780);
    const randomY = Phaser.Math.Between(20, 580);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);
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
  // 绘制12个随机位置的绿色六边形
  for (let i = 0; i < 12; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 六边形半径（大小16像素，半径为8像素）
    const radius = 8;
    
    // 计算六边形的6个顶点并绘制
    for (let j = 0; j < 6; j++) {
      // 计算角度（六边形每个角相隔60度）
      const angle = (Math.PI / 3) * j - Math.PI / 2; // 从顶部开始
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
    const randomX = Math.random() * 800;
    const randomY = Math.random() * 600;
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);
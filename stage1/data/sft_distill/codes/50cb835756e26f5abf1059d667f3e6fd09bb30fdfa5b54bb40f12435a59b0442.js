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
  // 粉色（pink）
  const pinkColor = 0xFFC0CB;
  
  // 六边形半径（大小24像素，半径为12）
  const hexRadius = 12;
  
  // 创建20个随机位置的粉色六边形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为粉色
    graphics.fillStyle(pinkColor, 1);
    
    // 开始绘制路径
    graphics.beginPath();
    
    // 绘制六边形的6个顶点
    // 六边形的顶点角度为 60 度间隔
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j; // 60度 = PI/3 弧度
      const x = hexRadius * Math.cos(angle);
      const y = hexRadius * Math.sin(angle);
      
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
    
    // 设置随机位置（确保六边形完全在画布内）
    const randomX = hexRadius + Math.random() * (800 - hexRadius * 2);
    const randomY = hexRadius + Math.random() * (600 - hexRadius * 2);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);
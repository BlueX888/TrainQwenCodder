const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 六边形参数
  const hexSize = 24; // 半径（中心到顶点距离）
  const hexColor = 0x00ffff; // 青色
  const hexCount = 15;
  
  // 生成15个随机位置的六边形
  for (let i = 0; i < hexCount; i++) {
    const graphics = this.add.graphics();
    
    // 设置填充颜色为青色
    graphics.fillStyle(hexColor, 1);
    
    // 绘制六边形（6个顶点）
    graphics.beginPath();
    
    for (let j = 0; j < 6; j++) {
      // 计算每个顶点的角度（从顶部开始，顺时针）
      const angle = (Math.PI / 3) * j - Math.PI / 2;
      const x = Math.cos(angle) * hexSize;
      const y = Math.sin(angle) * hexSize;
      
      if (j === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
    
    // 设置随机位置（留出边距避免六边形被裁剪）
    const randomX = hexSize + Math.random() * (800 - hexSize * 2);
    const randomY = hexSize + Math.random() * (600 - hexSize * 2);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);
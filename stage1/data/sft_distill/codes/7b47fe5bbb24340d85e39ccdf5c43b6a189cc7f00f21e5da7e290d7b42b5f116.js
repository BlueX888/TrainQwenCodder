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
  const graphics = this.add.graphics();
  
  // 设置红色填充
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < 20; i++) {
    // 随机位置，留出边距避免六边形被裁切
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const radius = 12; // 大小24像素，半径为12
    
    // 绘制六边形
    drawHexagon(graphics, x, y, radius);
  }
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} radius - 六边形半径
 */
function drawHexagon(graphics, x, y, radius) {
  graphics.beginPath();
  
  // 六边形有6个顶点，从顶部开始顺时针绘制
  for (let i = 0; i < 6; i++) {
    // 计算角度（从-90度开始，使六边形顶点朝上）
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(px, py);
    } else {
      graphics.lineTo(px, py);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
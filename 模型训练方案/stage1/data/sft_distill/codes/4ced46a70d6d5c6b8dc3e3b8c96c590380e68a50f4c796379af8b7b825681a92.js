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
  // 绘制20个随机位置的红色六边形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置（确保六边形完全在画布内）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置红色填充
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制正六边形
    drawHexagon(graphics, x, y, 24);
  }
}

/**
 * 绘制正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心 x 坐标
 * @param {number} y - 中心 y 坐标
 * @param {number} size - 六边形大小（从中心到顶点的距离）
 */
function drawHexagon(graphics, x, y, size) {
  graphics.beginPath();
  
  // 正六边形有6个顶点，每个顶点间隔60度（π/3 弧度）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度 = π/3
    const vertexX = x + size * Math.cos(angle);
    const vertexY = y + size * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(vertexX, vertexY);
    } else {
      graphics.lineTo(vertexX, vertexY);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
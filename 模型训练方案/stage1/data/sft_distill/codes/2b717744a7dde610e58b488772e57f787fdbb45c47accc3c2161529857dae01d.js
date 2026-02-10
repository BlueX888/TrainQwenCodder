const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const hexagonCount = 15;
  const hexagonSize = 64; // 六边形的"宽度"
  const hexagonRadius = hexagonSize / 2; // 从中心到顶点的距离
  
  // 创建15个随机位置的紫色六边形
  for (let i = 0; i < hexagonCount; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9932cc, 1); // 紫色 (DarkOrchid)
    
    // 计算随机位置（确保六边形完全在画布内）
    const x = Phaser.Math.Between(hexagonRadius, config.width - hexagonRadius);
    const y = Phaser.Math.Between(hexagonRadius, config.height - hexagonRadius);
    
    // 绘制六边形
    drawHexagon(graphics, x, y, hexagonRadius);
  }
}

/**
 * 绘制一个正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} centerX - 中心点 X 坐标
 * @param {number} centerY - 中心点 Y 坐标
 * @param {number} radius - 从中心到顶点的距离
 */
function drawHexagon(graphics, centerX, centerY, radius) {
  graphics.beginPath();
  
  // 六边形有6个顶点，每个顶点间隔60度（Math.PI / 3）
  // 从顶部开始绘制（-90度 或 -Math.PI / 2）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - (Math.PI / 2); // 每个顶点的角度
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
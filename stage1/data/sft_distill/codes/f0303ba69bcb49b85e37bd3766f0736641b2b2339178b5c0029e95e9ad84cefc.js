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
  
  // 设置粉色填充
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < 20; i++) {
    // 随机位置（留出边距避免六边形超出边界）
    const x = Math.random() * (800 - 48) + 24;
    const y = Math.random() * (600 - 48) + 24;
    
    // 绘制六边形
    drawHexagon(graphics, x, y, 12);
  }
}

/**
 * 绘制正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} radius - 外接圆半径（12像素，使六边形大小为24像素）
 */
function drawHexagon(graphics, x, y, radius) {
  graphics.beginPath();
  
  // 计算六边形的六个顶点
  // 从顶部开始，顺时针绘制（角度从 -90° 开始）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 每个顶点间隔60度
    const vx = x + radius * Math.cos(angle);
    const vy = y + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(vx, vy);
    } else {
      graphics.lineTo(vx, vy);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
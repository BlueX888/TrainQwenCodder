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
  
  // 六边形大小（从中心到顶点的距离）
  const hexSize = 24;
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < 20; i++) {
    // 随机位置，确保六边形完全在画布内
    const x = Phaser.Math.Between(hexSize, 800 - hexSize);
    const y = Phaser.Math.Between(hexSize, 600 - hexSize);
    
    // 绘制六边形
    drawHexagon(graphics, x, y, hexSize);
  }
}

/**
 * 绘制正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} size - 六边形大小（从中心到顶点的距离）
 */
function drawHexagon(graphics, x, y, size) {
  graphics.beginPath();
  
  // 计算六边形的6个顶点
  // 从顶部开始，顺时针绘制
  for (let i = 0; i < 6; i++) {
    // 每个顶点的角度（60度间隔）
    const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点在上方
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    
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
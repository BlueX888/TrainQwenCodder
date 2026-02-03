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
  // 绘制10个随机位置的青色六边形
  for (let i = 0; i < 10; i++) {
    // 生成随机位置（留出边界空间）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为青色
    graphics.fillStyle(0x00ffff, 1);
    
    // 绘制六边形
    drawHexagon(graphics, x, y, 16);
  }
}

/**
 * 绘制六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心 x 坐标
 * @param {number} y - 中心 y 坐标
 * @param {number} size - 六边形大小（从中心到顶点的距离）
 */
function drawHexagon(graphics, x, y, size) {
  graphics.beginPath();
  
  // 计算六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 每个角60度，起始角度-90度
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);
    
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
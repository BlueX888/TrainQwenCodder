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
  
  // 设置紫色填充
  graphics.fillStyle(0x9966ff, 1);
  
  // 绘制3个随机位置的六边形
  for (let i = 0; i < 3; i++) {
    // 生成随机位置，确保六边形完全在画布内
    const x = Phaser.Math.Between(64, 800 - 64);
    const y = Phaser.Math.Between(64, 600 - 64);
    
    // 绘制六边形
    drawHexagon(graphics, x, y, 32); // 半径32，直径64
  }
}

/**
 * 绘制正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} radius - 六边形半径（中心到顶点的距离）
 */
function drawHexagon(graphics, x, y, radius) {
  graphics.beginPath();
  
  // 计算六边形的6个顶点
  // 从顶部开始，顺时针绘制（角度从-90度开始）
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
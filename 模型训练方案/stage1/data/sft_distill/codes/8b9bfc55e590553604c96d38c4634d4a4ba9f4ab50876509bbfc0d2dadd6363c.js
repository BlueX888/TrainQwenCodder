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
    // 生成随机位置，确保六边形完全在画布内
    // 六边形半径为16像素，所以边界留出至少16像素
    const x = 16 + Math.random() * (800 - 32);
    const y = 16 + Math.random() * (600 - 32);
    
    drawHexagon(graphics, x, y, 16);
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
    // 角度：每个顶点间隔60度，起始角度为-90度（指向上方）
    const angle = (Math.PI / 3) * i - Math.PI / 2;
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
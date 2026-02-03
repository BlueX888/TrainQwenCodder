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
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制10个随机位置的六边形
  for (let i = 0; i < 10; i++) {
    // 随机生成位置，留出边距避免六边形超出画布
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 绘制六边形
    drawHexagon(graphics, x, y, 16);
  }
}

/**
 * 绘制正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} radius - 六边形半径（从中心到顶点的距离）
 */
function drawHexagon(graphics, x, y, radius) {
  graphics.beginPath();
  
  // 计算六边形的六个顶点
  // 从顶部开始，顺时针绘制
  for (let i = 0; i < 6; i++) {
    // 角度：每个顶点间隔 60 度（π/3 弧度）
    // 起始角度为 -90 度（-π/2），使第一个顶点在正上方
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(px, py);
    } else {
      graphics.lineTo(px, py);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
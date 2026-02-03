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
  
  // 设置红色填充
  graphics.fillStyle(0xff0000, 1);
  
  // 六边形的大小（半径）
  const hexSize = 16;
  
  // 绘制20个随机位置的六边形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置（留出边距避免六边形被裁剪）
    const x = Math.random() * (this.scale.width - hexSize * 2) + hexSize;
    const y = Math.random() * (this.scale.height - hexSize * 2) + hexSize;
    
    // 绘制六边形
    drawHexagon(graphics, x, y, hexSize);
  }
}

/**
 * 绘制正六边形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} x - 中心点 x 坐标
 * @param {number} y - 中心点 y 坐标
 * @param {number} size - 六边形半径
 */
function drawHexagon(graphics, x, y, size) {
  graphics.beginPath();
  
  // 计算六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 每个顶点间隔60度，起始角度-90度
    const vx = x + size * Math.cos(angle);
    const vy = y + size * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(vx, vy);
    } else {
      graphics.lineTo(vx, vy);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
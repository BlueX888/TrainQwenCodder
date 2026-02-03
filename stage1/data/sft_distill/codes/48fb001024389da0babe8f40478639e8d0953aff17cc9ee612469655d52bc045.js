const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 星形大小
  const starSize = 80;
  const halfSize = starSize / 2;
  
  // 绘制12个随机位置的紫色星形
  for (let i = 0; i < 12; i++) {
    // 随机位置（确保星形完全在画布内）
    const x = Phaser.Math.Between(halfSize, 800 - halfSize);
    const y = Phaser.Math.Between(halfSize, 600 - halfSize);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    graphics.setPosition(x, y);
    
    // 绘制五角星
    drawStar(graphics, 0, 0, 5, halfSize, halfSize * 0.4, 0x800080);
  }
}

/**
 * 绘制星形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} cx - 中心点 x 坐标
 * @param {number} cy - 中心点 y 坐标
 * @param {number} spikes - 星形尖角数量
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @param {number} color - 填充颜色
 */
function drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  
  graphics.fillStyle(color, 1);
  graphics.beginPath();
  graphics.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    // 外顶点
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    graphics.lineTo(x, y);
    rot += step;
    
    // 内顶点
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    graphics.lineTo(x, y);
    rot += step;
  }
  
  graphics.lineTo(cx, cy - outerRadius);
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
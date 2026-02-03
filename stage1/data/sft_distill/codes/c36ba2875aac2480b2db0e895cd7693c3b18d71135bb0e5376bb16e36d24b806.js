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
  // 绘制15个随机位置的绿色星形
  for (let i = 0; i < 15; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置填充颜色为绿色
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制星形路径
    drawStar(graphics, 16, 16, 5, 16, 8);
    
    // 设置随机位置（确保星形完全在画布内）
    const randomX = Phaser.Math.Between(16, 784);
    const randomY = Phaser.Math.Between(16, 584);
    graphics.setPosition(randomX, randomY);
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
 */
function drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

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
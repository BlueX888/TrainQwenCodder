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
  // 绘制5个随机位置的粉色星形
  for (let i = 0; i < 5; i++) {
    const graphics = this.add.graphics();
    
    // 设置粉色填充
    graphics.fillStyle(0xFFC0CB, 1);
    
    // 绘制五角星
    drawStar(graphics, 0, 0, 5, 32, 13);
    
    // 设置随机位置（考虑星形大小，避免超出边界）
    const randomX = Phaser.Math.Between(50, 750);
    const randomY = Phaser.Math.Between(50, 550);
    graphics.setPosition(randomX, randomY);
  }
}

/**
 * 绘制五角星
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} cx - 中心点 x 坐标
 * @param {number} cy - 中心点 y 坐标
 * @param {number} spikes - 尖角数量
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
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    graphics.lineTo(x, y);
    rot += step;

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
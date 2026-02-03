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
  // 星形参数
  const starSize = 64;
  const starCount = 20;
  const starColor = 0x0000ff; // 蓝色
  
  // 创建20个星形
  for (let i = 0; i < starCount; i++) {
    const graphics = this.add.graphics();
    
    // 设置填充颜色为蓝色
    graphics.fillStyle(starColor, 1);
    
    // 绘制星形路径
    drawStar(graphics, 0, 0, 5, starSize / 2, starSize / 4);
    
    // 设置随机位置（确保星形完全在画布内）
    const randomX = Phaser.Math.Between(starSize / 2, config.width - starSize / 2);
    const randomY = Phaser.Math.Between(starSize / 2, config.height - starSize / 2);
    graphics.setPosition(randomX, randomY);
  }
}

/**
 * 绘制星形路径
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} cx - 中心 x 坐标
 * @param {number} cy - 中心 y 坐标
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
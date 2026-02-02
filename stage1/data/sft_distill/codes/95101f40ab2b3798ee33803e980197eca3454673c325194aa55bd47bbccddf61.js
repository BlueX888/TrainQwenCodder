const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制20个随机位置的蓝色星形
  for (let i = 0; i < 20; i++) {
    // 生成随机位置（留出边距，避免星形被裁切）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置蓝色填充
    graphics.fillStyle(0x0000ff, 1);
    
    // 绘制星形
    drawStar(graphics, x, y, 5, 32, 16);
  }
}

/**
 * 绘制星形
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

  // 开始绘制路径
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
  
  // 填充星形
  graphics.fillPath();
}

new Phaser.Game(config);
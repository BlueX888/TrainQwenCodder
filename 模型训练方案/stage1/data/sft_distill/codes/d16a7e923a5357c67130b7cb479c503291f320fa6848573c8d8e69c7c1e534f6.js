const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 绘制20个随机位置的白色星形
  for (let i = 0; i < 20; i++) {
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置随机位置（留出边距以确保星形完全显示）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 绘制白色星形
    drawStar(graphics, x, y, 5, 40, 16, 0xffffff);
  }
}

/**
 * 绘制星形
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} cx - 中心点 x 坐标
 * @param {number} cy - 中心点 y 坐标
 * @param {number} spikes - 星形的尖角数量
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @param {number} color - 填充颜色
 */
function drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, color) {
  // 设置填充样式为白色
  graphics.fillStyle(color, 1);
  
  // 开始绘制路径
  graphics.beginPath();
  
  let rot = Math.PI / 2 * 3; // 起始角度（从顶部开始）
  let step = Math.PI / spikes; // 每个点之间的角度步长
  
  // 移动到第一个外部点
  graphics.moveTo(cx, cy - outerRadius);
  
  // 绘制星形的所有点
  for (let i = 0; i < spikes; i++) {
    // 外部点
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    graphics.lineTo(x, y);
    rot += step;
    
    // 内部点
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    graphics.lineTo(x, y);
    rot += step;
  }
  
  // 闭合路径
  graphics.lineTo(cx, cy - outerRadius);
  graphics.closePath();
  
  // 填充路径
  graphics.fillPath();
}

new Phaser.Game(config);
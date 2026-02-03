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
  const starSize = 80; // 星形大小
  const starCount = 12; // 星形数量
  const purpleColor = 0x800080; // 紫色
  
  // 创建12个随机位置的星形
  for (let i = 0; i < starCount; i++) {
    // 生成随机位置，确保星形不会超出边界
    const x = Phaser.Math.Between(starSize / 2, this.scale.width - starSize / 2);
    const y = Phaser.Math.Between(starSize / 2, this.scale.height - starSize / 2);
    
    // 创建 Graphics 对象绘制星形
    const graphics = this.add.graphics();
    graphics.setPosition(x, y);
    
    // 绘制五角星
    drawStar(graphics, 0, 0, 5, starSize / 2, starSize / 4, purpleColor);
  }
}

/**
 * 绘制星形函数
 * @param {Phaser.GameObjects.Graphics} graphics - Graphics 对象
 * @param {number} cx - 中心点 x 坐标
 * @param {number} cy - 中心点 y 坐标
 * @param {number} spikes - 星形尖角数量
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @param {number} color - 填充颜色
 */
function drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, color) {
  graphics.fillStyle(color, 1);
  graphics.beginPath();
  
  let rot = Math.PI / 2 * 3; // 从顶部开始
  let step = Math.PI / spikes;
  
  // 移动到第一个点
  graphics.moveTo(cx, cy - outerRadius);
  
  // 绘制星形路径
  for (let i = 0; i < spikes; i++) {
    // 外部顶点
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    graphics.lineTo(x, y);
    rot += step;
    
    // 内部顶点
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    graphics.lineTo(x, y);
    rot += step;
  }
  
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);
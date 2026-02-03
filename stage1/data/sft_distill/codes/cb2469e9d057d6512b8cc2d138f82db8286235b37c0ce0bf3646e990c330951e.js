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
  // 创建 Graphics 对象用于绘制星形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制星形的函数
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
  
  // 绘制3个随机位置的星形
  const starSize = 64; // 星形大小
  const outerRadius = starSize / 2;
  const innerRadius = outerRadius * 0.4; // 内半径为外半径的40%
  
  for (let i = 0; i < 3; i++) {
    // 生成随机位置，确保星形完全在画布内
    const randomX = outerRadius + Math.random() * (800 - starSize);
    const randomY = outerRadius + Math.random() * (600 - starSize);
    
    // 绘制五角星
    drawStar(graphics, randomX, randomY, 5, outerRadius, innerRadius);
  }
}

new Phaser.Game(config);
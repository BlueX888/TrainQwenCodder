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

  // 创建3个随机位置的灰色星形
  for (let i = 0; i < 3; i++) {
    const graphics = this.add.graphics();
    
    // 设置灰色填充
    graphics.fillStyle(0x808080, 1);
    
    // 星形大小为64像素（外接圆半径32，内接圆半径约为外接圆的0.4倍）
    const outerRadius = 32;
    const innerRadius = outerRadius * 0.4;
    
    // 绘制星形（中心点在0,0）
    drawStar(graphics, 0, 0, 5, outerRadius, innerRadius);
    
    // 设置随机位置（确保星形完全在画布内）
    const randomX = Phaser.Math.Between(outerRadius, 800 - outerRadius);
    const randomY = Phaser.Math.Between(outerRadius, 600 - outerRadius);
    graphics.setPosition(randomX, randomY);
  }
}

new Phaser.Game(config);
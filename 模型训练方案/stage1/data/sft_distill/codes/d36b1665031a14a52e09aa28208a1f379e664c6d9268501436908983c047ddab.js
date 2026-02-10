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
  // 绘制星形的辅助函数
  const drawStar = (graphics, cx, cy, spikes, outerRadius, innerRadius) => {
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
  };

  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色填充

  // 绘制 15 个随机位置的星形
  for (let i = 0; i < 15; i++) {
    // 生成随机位置（确保星形完全在画布内）
    const x = Phaser.Math.Between(32, 800 - 32);
    const y = Phaser.Math.Between(32, 600 - 32);
    
    // 绘制星形：5个尖角，外半径16，内半径8（总大小约32像素）
    drawStar(graphics, x, y, 5, 16, 8);
  }
}

new Phaser.Game(config);
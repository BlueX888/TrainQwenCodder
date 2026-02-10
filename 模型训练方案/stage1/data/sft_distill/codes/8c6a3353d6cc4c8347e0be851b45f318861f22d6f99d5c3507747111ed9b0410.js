const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  
  // 绘制星形的函数
  function drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, color) {
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
    graphics.fillStyle(color, 1);
    graphics.fillPath();
  }

  // 绘制粉色星形 (中心在 60, 60，方便生成纹理)
  drawStar(graphics, 60, 60, 5, 50, 25, 0xFF69B4);
  
  // 生成纹理
  graphics.generateTexture('pinkStar', 120, 120);
  graphics.destroy();

  // 创建星形精灵并放置在屏幕中心
  const star = this.add.sprite(400, 300, 'pinkStar');
  
  // 创建旋转动画
  this.tweens.add({
    targets: star,
    rotation: Math.PI * 2, // 旋转 360 度 (2π 弧度)
    duration: 1000, // 1 秒完成一次旋转
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1 // 无限循环
  });
}

function update(time, delta) {
  // 本例不需要每帧更新逻辑
}

new Phaser.Game(config);
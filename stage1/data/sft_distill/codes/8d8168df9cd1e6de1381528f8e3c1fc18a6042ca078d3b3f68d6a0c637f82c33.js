const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  
  // 绘制星形的函数
  const drawStar = (graphics, cx, cy, spikes, outerRadius, innerRadius, color) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.fillStyle(color, 1);
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

  // 绘制粉色星形（中心点在 80, 80，便于生成纹理）
  drawStar(graphics, 80, 80, 5, 70, 30, 0xff69b4);
  
  // 生成纹理
  graphics.generateTexture('pinkStar', 160, 160);
  graphics.destroy();

  // 创建星形精灵并放置在屏幕中央
  const star = this.add.sprite(400, 300, 'pinkStar');

  // 创建旋转动画
  this.tweens.add({
    targets: star,
    rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
    duration: 1000, // 1 秒
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1 // 无限循环
  });

  // 添加文字说明
  this.add.text(400, 500, '粉色星形旋转动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
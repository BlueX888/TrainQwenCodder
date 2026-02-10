const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
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

  // 绘制粉色星形
  graphics.clear();
  drawStar(graphics, 60, 60, 5, 50, 25, 0xff69b4);
  
  // 生成纹理
  graphics.generateTexture('pinkStar', 120, 120);
  graphics.destroy();

  // 创建星形精灵并居中
  const star = this.add.sprite(400, 300, 'pinkStar');

  // 创建缩放动画
  // 从原始大小缩放到 1.5 倍，然后返回，持续 1.5 秒，无限循环
  this.tweens.add({
    targets: star,
    scaleX: 1.5,
    scaleY: 1.5,
    duration: 1500,
    yoyo: true,        // 动画结束后反向播放
    repeat: -1,        // 无限循环 (-1 表示永远重复)
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
}

new Phaser.Game(config);
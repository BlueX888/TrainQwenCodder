const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形
  const graphics = this.add.graphics();
  
  // 绘制星形的函数
  function drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius, color) {
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
  }

  // 绘制橙色星形（中心在 50, 50，外半径 40，内半径 20）
  drawStar(graphics, 50, 50, 5, 40, 20, 0xFFA500);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();

  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');

  // 创建补间动画：从左到右，4秒，往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧
    duration: 4000, // 4秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环
    ease: 'Linear' // 线性运动
  });

  // 添加提示文本
  this.add.text(400, 50, 'Orange Star Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
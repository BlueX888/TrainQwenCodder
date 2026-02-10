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
  // 无需预加载外部资源
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
  };

  // 绘制粉色星形（中心点在100,100，用于生成纹理）
  drawStar(graphics, 100, 100, 5, 80, 40, 0xff69b4);
  
  // 生成纹理
  graphics.generateTexture('pinkStar', 200, 200);
  
  // 清除 graphics 对象
  graphics.destroy();
  
  // 创建使用星形纹理的精灵，放置在屏幕中心
  const star = this.add.sprite(400, 300, 'pinkStar');
  
  // 设置精灵的原点为中心
  star.setOrigin(0.5, 0.5);
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,           // 动画目标
    scaleX: 1.5,            // X轴缩放到1.5倍
    scaleY: 1.5,            // Y轴缩放到1.5倍
    duration: 1500,         // 持续时间1.5秒（1500毫秒）
    ease: 'Sine.easeInOut', // 缓动函数，使动画更平滑
    yoyo: true,             // 启用yoyo效果，动画会反向播放回到初始状态
    repeat: -1              // 无限循环（-1表示永久重复）
  });
}

// 创建游戏实例
new Phaser.Game(config);
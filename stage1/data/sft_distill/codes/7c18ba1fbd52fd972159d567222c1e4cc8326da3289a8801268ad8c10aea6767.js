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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制五角星
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 16;
  const points = 5;
  
  const starPath = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    starPath.push(x, y);
  }
  
  graphics.beginPath();
  graphics.moveTo(starPath[0], starPath[1]);
  for (let i = 2; i < starPath.length; i += 2) {
    graphics.lineTo(starPath[i], starPath[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画 Tween
  // 从 1 缩放到 0.16，然后从 0.16 恢复到 1，每个过程 0.5 秒
  this.tweens.add({
    targets: star,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 500, // 0.5 秒缩小
    yoyo: true,    // 启用 yoyo 模式，自动反向播放（恢复到原始大小）
    repeat: -1,    // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 计算六边形顶点坐标
  const centerX = 400;
  const centerY = 300;
  const radius = 100;
  const sides = 6;
  
  // 生成六边形顶点数组
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色填充
  graphics.lineStyle(3, 0xffffff, 1); // 白色边框
  
  // 绘制填充的六边形
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 设置初始透明度为 0
  graphics.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,
    alpha: { from: 0, to: 1 },
    duration: 1000, // 1秒
    ease: 'Linear',
    yoyo: false, // 不反向播放
    loop: -1, // 无限循环
    onLoop: () => {
      // 每次循环重置为透明
      graphics.setAlpha(0);
    }
  });
}

new Phaser.Game(config);
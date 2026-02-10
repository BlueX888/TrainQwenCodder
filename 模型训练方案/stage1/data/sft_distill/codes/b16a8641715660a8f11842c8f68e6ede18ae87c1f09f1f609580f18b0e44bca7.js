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
  // 创建一个星形图形对象
  const graphics = this.add.graphics();
  
  // 设置星形的填充颜色
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形（中心在 400, 300）
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 80;
  const innerRadius = 40;
  const points = 5;
  
  // 计算星形的顶点
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 创建缩放动画
  // 从原始大小（scale: 1）缩放到 24%（scale: 0.24），持续 3 秒
  // yoyo: true 使其自动恢复到原始大小
  // repeat: -1 实现无限循环
  this.tweens.add({
    targets: graphics,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 3000,        // 3 秒
    yoyo: true,            // 动画结束后反向播放（恢复原始大小）
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, '星形缩放动画（3秒循环）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 24%', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
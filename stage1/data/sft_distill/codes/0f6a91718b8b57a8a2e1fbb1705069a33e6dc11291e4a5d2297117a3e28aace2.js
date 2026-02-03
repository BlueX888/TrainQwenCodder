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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius + outerRadius;
    const y = Math.sin(angle) * radius + outerRadius;
    points.push(x, y);
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  // 从 1 缩放到 0.16，然后返回到 1，总时长 0.5 秒
  this.tweens.add({
    targets: star,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 250, // 0.25 秒缩小
    yoyo: true,    // 自动反向播放（恢复）
    repeat: -1,    // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加说明文字
  this.add.text(400, 500, '星形缩放动画（循环播放）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
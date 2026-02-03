const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 绘制一个黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 50;
  const innerRadius = 20;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 64 + Math.cos(angle) * radius;
    const y = 64 + Math.sin(angle) * radius;
    points.push(x, y);
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中心
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  // 从 1 缩放到 0.16，然后返回到 1，每个方向 0.5 秒
  this.tweens.add({
    targets: star,
    scale: 0.16,           // 目标缩放值 16%
    duration: 500,         // 持续时间 0.5 秒
    yoyo: true,            // 启用往返效果（缩小后再放大）
    loop: -1,              // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 550, 'Star scaling animation (1.0 → 0.16 → 1.0)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);
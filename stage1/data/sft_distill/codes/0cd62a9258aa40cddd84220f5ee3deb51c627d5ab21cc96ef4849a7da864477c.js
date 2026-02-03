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
  // 使用 Graphics 绘制星形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制星形路径
  const points = [];
  const radius1 = 50; // 外半径
  const radius2 = 20; // 内半径
  const spikes = 5;
  const centerX = 60;
  const centerY = 60;
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? radius1 : radius2;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(new Phaser.Math.Vector2(x, y));
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 120, 120);
  graphics.destroy();
  
  // 创建星形精灵并放置在屏幕中心
  const star = this.add.image(400, 300, 'star');
  
  // 创建缩放补间动画
  this.tweens.add({
    targets: star,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 1500, // 1.5秒
    ease: 'Sine.easeInOut', // 使用正弦缓动使动画更平滑
    yoyo: true, // 来回播放（缩小后再放大）
    loop: -1, // 无限循环
    repeat: 0 // yoyo模式下不需要额外repeat
  });
  
  // 添加文字说明
  this.add.text(400, 550, '星形缩放动画 (1.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
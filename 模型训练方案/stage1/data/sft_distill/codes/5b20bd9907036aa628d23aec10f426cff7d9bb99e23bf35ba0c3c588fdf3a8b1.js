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
  // 创建绿色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制星形路径
  const points = [];
  const starPoints = 5;
  const outerRadius = 50;
  const innerRadius = 20;
  
  for (let i = 0; i < starPoints * 2; i++) {
    const angle = (i * Math.PI) / starPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.image(400, 200, 'star');
  
  // 创建弹跳动画
  // 从初始位置(y=200)弹跳到底部(y=500)，然后返回
  this.tweens.add({
    targets: star,
    y: 500, // 弹跳到的目标位置
    duration: 1500, // 下落 1.5 秒
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 往返运动
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });
  
  // 添加提示文字
  this.add.text(400, 50, 'Bouncing Star Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 580, '3-second bounce cycle (1.5s down + 1.5s up)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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

let starCount = 0;
const MAX_STARS = 5;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用Graphics创建白色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 20;
  const innerRadius = 10;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push({
      x: Math.cos(angle) * radius + outerRadius,
      y: Math.sin(angle) * radius + outerRadius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 初始化星形计数器
  starCount = 0;
  
  // 创建定时器，每1.5秒执行一次
  this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 添加文本显示当前星形数量
  this.starCountText = this.add.text(10, 10, 'Stars: 0/5', {
    fontSize: '24px',
    fill: '#ffffff'
  });
}

function spawnStar() {
  // 检查是否已达到最大数量
  if (starCount >= MAX_STARS) {
    return;
  }
  
  // 生成随机位置（确保星形完全在场景内）
  const margin = 20; // 星形半径
  const x = Phaser.Math.Between(margin, this.scale.width - margin);
  const y = Phaser.Math.Between(margin, this.scale.height - margin);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'star');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  starCount++;
  
  // 更新文本显示
  this.starCountText.setText(`Stars: ${starCount}/${MAX_STARS}`);
}

new Phaser.Game(config);
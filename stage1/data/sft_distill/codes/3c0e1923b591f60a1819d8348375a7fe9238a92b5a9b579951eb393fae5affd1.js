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
const MAX_STARS = 12;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00ffff, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 25;
  const innerRadius = 12;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('cyanStar', 50, 50);
  graphics.destroy();
  
  // 重置星形计数
  starCount = 0;
  
  // 创建定时器事件，每2.5秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒
    callback: createStar,
    callbackScope: this,
    loop: true
  });
  
  // 添加文本提示
  this.add.text(10, 10, 'Stars: 0 / 12', {
    fontSize: '20px',
    color: '#00ffff'
  }).setName('starText');
}

function createStar() {
  // 检查是否达到上限
  if (starCount >= MAX_STARS) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成12个星形，停止生成');
    return;
  }
  
  // 生成随机位置（避免边缘）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'cyanStar');
  
  // 添加缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 更新计数
  starCount++;
  
  // 更新文本显示
  const starText = this.children.getByName('starText');
  if (starText) {
    starText.setText(`Stars: ${starCount} / ${MAX_STARS}`);
  }
  
  console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);
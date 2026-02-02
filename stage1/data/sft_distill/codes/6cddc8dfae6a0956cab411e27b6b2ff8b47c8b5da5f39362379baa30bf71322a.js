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

let stars = [];
let starTimer = null;
const MAX_STARS = 8;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00ffff, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push(radius * Math.cos(angle), radius * Math.sin(angle));
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建定时器，每1.5秒生成一个星形
  starTimer = this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 添加文本提示
  this.add.text(10, 10, 'Stars: 0/8', {
    fontSize: '24px',
    color: '#00ffff'
  }).setName('starCount');
}

function spawnStar() {
  // 检查是否已达到最大数量
  if (stars.length >= MAX_STARS) {
    if (starTimer) {
      starTimer.remove();
      starTimer = null;
    }
    return;
  }
  
  // 在随机位置生成星形（避免边缘）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  const star = this.add.image(x, y, 'star');
  star.setScale(1);
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  stars.push(star);
  
  // 更新计数文本
  const countText = this.children.getByName('starCount');
  if (countText) {
    countText.setText(`Stars: ${stars.length}/8`);
  }
}

new Phaser.Game(config);
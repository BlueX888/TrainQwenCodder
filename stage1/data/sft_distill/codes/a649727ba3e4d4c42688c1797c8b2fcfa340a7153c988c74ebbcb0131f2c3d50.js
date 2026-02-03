const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let stars = [];
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.lineStyle(2, 0x0044cc, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const numPoints = 5;
  const outerRadius = 30;
  const innerRadius = 15;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push(
      radius * Math.cos(angle) + outerRadius,
      radius * Math.sin(angle) + outerRadius
    );
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
  graphics.generateTexture('blueStar', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建定时器，每1.5秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 1500,
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每1.5秒生成一个蓝色星形\n最多生成3个', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function spawnStar() {
  // 检查是否已经生成了3个星形
  if (stars.length >= 3) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 在随机位置生成星形
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(100, 550);
  
  const star = this.add.image(x, y, 'blueStar');
  
  // 添加简单的缩放动画
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 将星形添加到数组中
  stars.push(star);
  
  console.log(`生成第 ${stars.length} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
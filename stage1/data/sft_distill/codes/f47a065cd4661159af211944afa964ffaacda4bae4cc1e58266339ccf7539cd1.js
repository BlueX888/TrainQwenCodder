const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let stars = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.lineStyle(2, 0xffaa00, 1);
  
  // 绘制星形路径
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 25;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('orangeStar', 50, 50);
  graphics.destroy();
  
  // 创建定时器，每0.5秒生成一个星形
  this.time.addEvent({
    delay: 500, // 0.5秒
    callback: createStar,
    callbackScope: this,
    repeat: 2, // 重复2次，加上首次执行共3次
    loop: false
  });
}

function createStar() {
  // 检查是否已达到最大数量
  if (stars.length >= 3) {
    return;
  }
  
  // 生成随机位置（避免星形超出边界）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'orangeStar');
  stars.push(star);
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  console.log(`星形已生成，当前数量: ${stars.length}/3`);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);
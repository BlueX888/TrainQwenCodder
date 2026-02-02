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

// 存储生成的星形
let stars = [];
const MAX_STARS = 8;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用Graphics创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00ffff, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 25;
  const innerRadius = 12;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }
  
  // 绘制星形
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 60, 60);
  graphics.destroy();
  
  // 创建定时器，每1.5秒触发一次
  this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 添加文本提示
  this.add.text(10, 10, '星形数量: 0 / 8', {
    fontSize: '20px',
    color: '#ffffff'
  }).setName('counterText');
}

// 生成星形的函数
function spawnStar() {
  // 检查是否已达到最大数量
  if (stars.length >= MAX_STARS) {
    return;
  }
  
  // 在随机位置生成星形
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  const star = this.add.image(x, y, 'star');
  star.setScale(0); // 初始缩放为0，用于添加出现动画
  
  // 添加缩放动画
  this.tweens.add({
    targets: star,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 添加到数组中
  stars.push(star);
  
  // 更新计数文本
  const counterText = this.children.getByName('counterText');
  if (counterText) {
    counterText.setText(`星形数量: ${stars.length} / ${MAX_STARS}`);
  }
  
  // 如果达到最大数量，显示完成提示
  if (stars.length >= MAX_STARS) {
    this.add.text(400, 300, '已生成全部星形！', {
      fontSize: '32px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
  }
}

new Phaser.Game(config);
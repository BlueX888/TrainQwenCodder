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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.add.graphics();
  
  // 绘制蓝色星形
  graphics.fillStyle(0x0088ff, 1);
  graphics.lineStyle(2, 0x0066cc, 1);
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    starPoints.push(
      outerRadius + radius * Math.cos(angle),
      outerRadius + radius * Math.sin(angle)
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
  
  // 添加标题文本
  this.add.text(400, 30, '蓝色星形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 60, '每1.5秒生成一个，最多3个', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 创建定时器，每1.5秒生成一个星形
  // repeat: 2 表示除了首次执行外再重复2次，总共3次
  this.time.addEvent({
    delay: 1500,           // 1.5秒
    callback: createStar,  // 回调函数
    callbackScope: this,   // 回调作用域
    repeat: 2,             // 重复2次（加上首次共3次）
    loop: false            // 不循环
  });
}

/**
 * 创建星形的回调函数
 */
function createStar() {
  // 生成随机位置（避免太靠近边缘）
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(150, 550);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'blueStar');
  
  // 添加缩放动画效果
  star.setScale(0);
  this.tweens.add({
    targets: star,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 添加旋转动画
  this.tweens.add({
    targets: star,
    angle: 360,
    duration: 2000,
    repeat: -1,
    ease: 'Linear'
  });
  
  // 存储星形引用
  stars.push(star);
  
  // 显示已生成数量
  const countText = this.add.text(x, y + 50, `星形 ${stars.length}/3`, {
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 3 }
  }).setOrigin(0.5);
  
  console.log(`生成第 ${stars.length} 个星形，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);
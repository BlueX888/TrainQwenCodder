const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

// 星形数组，用于跟踪已生成的星形
let stars = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制星形路径
  const starPoints = createStarPoints(0, 0, 5, 30, 15);
  
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('blueStar', 60, 60);
  graphics.destroy();
  
  // 创建定时器事件，每1.5秒触发一次
  this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每1.5秒生成一个蓝色星形\n最多生成3个', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

/**
 * 生成星形的函数
 */
function spawnStar() {
  // 检查是否已达到最大数量
  if (stars.length >= 3) {
    return;
  }
  
  // 生成随机位置（留出边距避免星形超出屏幕）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(80, 550);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'blueStar');
  
  // 添加到数组中跟踪
  stars.push(star);
  
  // 添加简单的缩放动画效果
  star.setScale(0);
  this.tweens.add({
    targets: star,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  console.log(`生成星形 #${stars.length} 在位置 (${x}, ${y})`);
}

/**
 * 创建星形的顶点坐标
 * @param {number} cx - 中心X坐标
 * @param {number} cy - 中心Y坐标
 * @param {number} spikes - 星形尖角数量
 * @param {number} outerRadius - 外半径
 * @param {number} innerRadius - 内半径
 * @returns {Array} 顶点坐标数组
 */
function createStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
  const points = [];
  const step = Math.PI / spikes;
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    });
  }
  
  return points;
}

new Phaser.Game(config);
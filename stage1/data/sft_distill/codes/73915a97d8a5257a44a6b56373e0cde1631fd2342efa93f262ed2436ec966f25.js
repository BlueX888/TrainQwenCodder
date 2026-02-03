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
  // 无需预加载外部资源
}

function create() {
  // 重置星形计数
  starCount = 0;
  
  // 使用 Graphics 创建灰色星形纹理
  createStarTexture.call(this);
  
  // 创建定时器事件，每2秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2000,                // 2秒
    callback: spawnStar,        // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Stars will spawn every 2 seconds (max 12)', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

/**
 * 创建星形纹理
 */
function createStarTexture() {
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制星形（五角星）
  const points = [];
  const outerRadius = 25;
  const innerRadius = 10;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 30 + Math.cos(angle) * radius,
      y: 30 + Math.sin(angle) * radius
    });
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 60, 60);
  graphics.destroy();
}

/**
 * 生成星形
 */
function spawnStar() {
  // 检查是否达到上限
  if (starCount >= MAX_STARS) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, 'All 12 stars spawned!', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（避免边缘）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(80, 550);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'star');
  
  // 添加淡入动画效果
  star.setAlpha(0);
  this.tweens.add({
    targets: star,
    alpha: 1,
    duration: 500,
    ease: 'Power2'
  });
  
  // 增加计数
  starCount++;
  
  // 更新计数显示
  updateStarCount.call(this);
}

/**
 * 更新星形计数显示
 */
function updateStarCount() {
  // 移除旧的计数文本（如果存在）
  if (this.countText) {
    this.countText.destroy();
  }
  
  // 创建新的计数文本
  this.countText = this.add.text(10, 40, `Stars: ${starCount} / ${MAX_STARS}`, {
    fontSize: '20px',
    color: '#00ff00'
  });
}

new Phaser.Game(config);
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
  createStarTexture(this);
  
  // 添加定时器事件，每2秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 2000,           // 2秒
    callback: spawnStar,   // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 显示提示文本
  this.add.text(10, 10, '每2秒生成一个灰色星形 (最多12个)', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

/**
 * 创建星形纹理
 */
function createStarTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制五角星
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
 * 在随机位置生成星形
 */
function spawnStar() {
  // 检查是否达到最大数量
  if (starCount >= MAX_STARS) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, '已生成12个星形！', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（留出边距）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
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
  const countText = this.add.text(10, 30, `当前星形数量: ${starCount}/${MAX_STARS}`, {
    fontSize: '16px',
    color: '#ffffff'
  });
}

// 启动游戏
new Phaser.Game(config);
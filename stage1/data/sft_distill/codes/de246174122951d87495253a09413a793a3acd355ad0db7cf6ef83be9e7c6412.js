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
const MAX_STARS = 15;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形纹理
  createStarTexture(this);
  
  // 创建定时器，每4秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 4000,           // 4秒
    callback: spawnStar,   // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每4秒生成一个星形，最多15个', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 显示星形计数
  this.countText = this.add.text(10, 35, `星形数量: ${starCount}/${MAX_STARS}`, {
    fontSize: '16px',
    color: '#ffff00'
  });
}

/**
 * 创建星形纹理
 */
function createStarTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 绘制五角星
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  const points = [];
  const outerRadius = 25;
  const innerRadius = 10;
  const numPoints = 5;
  
  // 计算五角星的顶点
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
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
    this.add.text(400, 300, '已生成15个星形！', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（避免星形超出边界）
  const margin = 40;
  const x = Phaser.Math.Between(margin, this.scale.width - margin);
  const y = Phaser.Math.Between(margin + 60, this.scale.height - margin);
  
  // 创建星形图像
  const star = this.add.image(x, y, 'star');
  
  // 添加简单的缩放动画
  this.tweens.add({
    targets: star,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 200,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
  
  // 增加计数
  starCount++;
  
  // 更新计数文本
  this.countText.setText(`星形数量: ${starCount}/${MAX_STARS}`);
}

// 创建游戏实例
new Phaser.Game(config);
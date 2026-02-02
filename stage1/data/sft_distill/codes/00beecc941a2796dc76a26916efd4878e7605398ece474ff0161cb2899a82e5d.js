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
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建星形纹理
  createStarTexture(this);
  
  // 创建定时器，每4秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 4000,                // 4秒
    callback: spawnStar,        // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });
  
  // 添加文本显示当前星形数量
  this.starCountText = this.add.text(10, 10, 'Stars: 0 / 15', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

// 创建星形纹理
function createStarTexture(scene) {
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffd700, 1);
  
  // 星形的5个顶点（外圈）和5个内圈点
  const points = [];
  const outerRadius = 20;
  const innerRadius = 8;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    points.push({
      x: 25 + Math.cos(angle) * radius,
      y: 25 + Math.sin(angle) * radius
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
}

// 生成星形
function spawnStar() {
  // 检查是否已达到最大数量
  if (starCount >= 15) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 在随机位置生成星形
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  const star = this.add.image(x, y, 'star');
  
  // 添加缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  starCount++;
  
  // 更新文本显示
  this.starCountText.setText(`Stars: ${starCount} / 15`);
}

// 创建游戏实例
new Phaser.Game(config);
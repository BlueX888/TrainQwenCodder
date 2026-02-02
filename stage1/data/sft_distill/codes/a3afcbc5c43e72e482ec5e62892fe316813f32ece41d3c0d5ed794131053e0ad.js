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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建星形纹理
  createStarTexture.call(this);
  
  // 创建定时器事件，每4秒执行一次
  timerEvent = this.time.addEvent({
    delay: 4000,                // 4秒
    callback: spawnStar,        // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Stars: 0 / 15', {
    fontSize: '24px',
    color: '#ffffff'
  }).setName('starText');
}

// 创建星形纹理
function createStarTexture() {
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 星形的5个外顶点和5个内顶点
  const points = [];
  const outerRadius = 25;
  const innerRadius = 10;
  const numPoints = 5;
  
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
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 60, 60);
  graphics.destroy();
}

// 生成星形
function spawnStar() {
  // 检查是否达到最大数量
  if (starCount >= MAX_STARS) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成15个星形，停止生成');
    return;
  }
  
  // 随机位置（留出边距避免星形被裁剪）
  const margin = 40;
  const x = Phaser.Math.Between(margin, this.scale.width - margin);
  const y = Phaser.Math.Between(margin, this.scale.height - margin);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'star');
  star.setScale(1);
  
  // 添加缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 更新计数
  starCount++;
  
  // 更新文本显示
  const starText = this.children.getByName('starText');
  if (starText) {
    starText.setText(`Stars: ${starCount} / ${MAX_STARS}`);
  }
  
  console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
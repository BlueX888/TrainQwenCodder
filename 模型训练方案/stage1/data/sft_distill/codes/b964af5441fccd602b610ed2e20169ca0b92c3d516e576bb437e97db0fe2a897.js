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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 添加标题文本
  this.add.text(10, 10, 'Stars Generated: 0 / 15', {
    fontSize: '20px',
    color: '#ffffff'
  }).setName('counterText');

  // 创建定时器事件，每4秒生成一个星形
  this.time.addEvent({
    delay: 4000,                    // 4秒间隔
    callback: generateStar,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: MAX_STARS - 1           // 重复14次（加上第一次共15次）
  });

  // 立即生成第一个星形
  generateStar.call(this);
}

function generateStar() {
  // 检查是否已达到最大数量
  if (starCount >= MAX_STARS) {
    return;
  }

  // 生成随机位置（留出边距避免星形被裁剪）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);

  // 创建Graphics对象绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffd700, 1); // 金黄色边框

  // 绘制五角星
  const points = 5;           // 五个角
  const outerRadius = 25;     // 外半径
  const innerRadius = 12;     // 内半径
  const angle = Math.PI / points;

  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const currentAngle = i * angle - Math.PI / 2; // 从顶部开始
    const px = x + Math.cos(currentAngle) * radius;
    const py = y + Math.sin(currentAngle) * radius;
    
    if (i === 0) {
      graphics.moveTo(px, py);
    } else {
      graphics.lineTo(px, py);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();

  // 添加淡入动画效果
  graphics.setAlpha(0);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 500,
    ease: 'Power2'
  });

  // 更新计数
  starCount++;
  
  // 更新显示文本
  const counterText = this.children.getByName('counterText');
  if (counterText) {
    counterText.setText(`Stars Generated: ${starCount} / ${MAX_STARS}`);
  }

  // 在控制台输出日志
  console.log(`Star ${starCount} generated at (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
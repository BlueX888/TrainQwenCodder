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
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  createStarTexture.call(this);
  
  // 创建定时器事件，每2秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 2000,                    // 2秒延迟
    callback: spawnStar,            // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true                      // 循环执行
  });
  
  // 添加文本显示当前星形数量
  this.starCountText = this.add.text(16, 16, 'Stars: 0 / 12', {
    fontSize: '24px',
    fill: '#ffffff'
  });
}

/**
 * 创建星形纹理
 */
function createStarTexture() {
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);  // 黄色
  graphics.lineStyle(2, 0xffa500, 1); // 橙色描边
  
  // 星形参数
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  // 绘制五角星
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
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

/**
 * 生成星形
 */
function spawnStar() {
  // 检查是否达到最大数量
  if (starCount >= MAX_STARS) {
    timerEvent.remove();  // 移除定时器
    console.log('已生成最大数量的星形');
    return;
  }
  
  // 生成随机位置（避免超出边界）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建星形图像
  const star = this.add.image(x, y, 'star');
  
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
  
  // 增加计数
  starCount++;
  this.starCountText.setText(`Stars: ${starCount} / ${MAX_STARS}`);
  
  console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
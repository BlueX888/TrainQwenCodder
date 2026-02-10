const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let starCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建白色星形纹理
  createStarTexture(this);
  
  // 初始化星形计数
  starCount = 0;
  
  // 创建定时器，每1.5秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 1500,           // 1.5秒
    callback: spawnStar,   // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
}

/**
 * 创建星形纹理
 */
function createStarTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 绘制白色星形
  graphics.fillStyle(0xffffff, 1);
  
  // 星形参数
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  // 计算星形顶点
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
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

/**
 * 生成星形
 */
function spawnStar() {
  // 检查是否已达到最大数量
  if (starCount >= 5) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成5个星形，停止生成');
    return;
  }
  
  // 生成随机位置（留出边距避免星形被裁切）
  const margin = 50;
  const x = Phaser.Math.Between(margin, this.scale.width - margin);
  const y = Phaser.Math.Between(margin, this.scale.height - margin);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'star');
  
  // 添加简单的缩放动画效果
  star.setScale(0);
  this.tweens.add({
    targets: star,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  starCount++;
  console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
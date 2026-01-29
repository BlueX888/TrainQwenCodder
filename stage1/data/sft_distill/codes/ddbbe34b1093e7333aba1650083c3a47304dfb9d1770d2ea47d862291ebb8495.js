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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  createStarTexture.call(this);
  
  // 创建定时器事件，每2秒生成一个星形
  this.time.addEvent({
    delay: 2000,                    // 延迟2秒
    callback: spawnStar,            // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: MAX_STARS - 1           // 重复11次（加上第一次共12次）
  });
  
  // 立即生成第一个星形
  spawnStar.call(this);
}

/**
 * 创建星形纹理
 */
function createStarTexture() {
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 星形的中心点
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 20;
  const innerRadius = 10;
  const points = 5;
  
  // 绘制星形路径
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
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
  graphics.generateTexture('star', 50, 50);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
}

/**
 * 在随机位置生成星形
 */
function spawnStar() {
  if (starCount >= MAX_STARS) {
    return;
  }
  
  // 生成随机位置（考虑边界，避免星形超出屏幕）
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
  
  // 计数器加1
  starCount++;
  
  // 在控制台输出当前星形数量
  console.log(`已生成星形数量: ${starCount}/${MAX_STARS}`);
}

// 创建游戏实例
new Phaser.Game(config);
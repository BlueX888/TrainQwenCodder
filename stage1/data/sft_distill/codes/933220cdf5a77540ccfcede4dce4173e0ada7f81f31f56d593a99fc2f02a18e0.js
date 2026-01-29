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

let diamondCount = 0;
const MAX_DIAMONDS = 12;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色菱形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 绘制菱形（四个顶点）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);        // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建定时器事件，每2.5秒生成一个菱形
  timerEvent = this.time.addEvent({
    delay: 2500,              // 2.5秒
    callback: spawnDiamond,   // 回调函数
    callbackScope: this,      // 回调作用域
    loop: true                // 循环执行
  });
  
  // 立即生成第一个菱形
  spawnDiamond.call(this);
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    if (timerEvent) {
      timerEvent.remove();  // 移除定时器
      timerEvent = null;
      console.log('已生成12个菱形，停止生成');
    }
    return;
  }
  
  // 生成随机位置（留出边距，避免菱形超出边界）
  const margin = 30;
  const randomX = Phaser.Math.Between(margin, 800 - margin);
  const randomY = Phaser.Math.Between(margin, 600 - margin);
  
  // 创建菱形精灵
  const diamond = this.add.image(randomX, randomY, 'diamond');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: diamond,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  diamondCount++;
  console.log(`生成第 ${diamondCount} 个菱形，位置: (${randomX}, ${randomY})`);
}

new Phaser.Game(config);
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
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色菱形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFF8C00, 1);
  
  // 绘制菱形（四个点构成的多边形）
  const size = 20;
  const points = [
    { x: 0, y: -size },      // 上顶点
    { x: size, y: 0 },       // 右顶点
    { x: 0, y: size },       // 下顶点
    { x: -size, y: 0 }       // 左顶点
  ];
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建定时器事件，每0.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 500,                    // 0.5秒 = 500毫秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true
  });
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    timerEvent.remove();  // 停止定时器
    console.log('已生成12个菱形，停止生成');
    return;
  }
  
  // 生成随机位置（留出边距避免菱形超出边界）
  const margin = 30;
  const randomX = Phaser.Math.Between(margin, config.width - margin);
  const randomY = Phaser.Math.Between(margin, config.height - margin);
  
  // 创建菱形精灵
  const diamond = this.add.image(randomX, randomY, 'diamond');
  
  // 增加计数
  diamondCount++;
  
  console.log(`生成第 ${diamondCount} 个菱形，位置: (${randomX}, ${randomY})`);
}

new Phaser.Game(config);
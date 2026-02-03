const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

let diamondCount = 0;
const MAX_DIAMONDS = 3;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制菱形（四个顶点）
  const diamondSize = 40;
  const points = [
    0, -diamondSize,      // 上顶点
    diamondSize, 0,       // 右顶点
    0, diamondSize,       // 下顶点
    -diamondSize, 0       // 左顶点
  ];
  
  graphics.fillPoints(points, true);
  graphics.generateTexture('diamond', diamondSize * 2, diamondSize * 2);
  graphics.destroy();
  
  // 创建定时器，每3秒触发一次
  timerEvent = this.time.addEvent({
    delay: 3000,           // 3秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true             // 循环执行
  });
  
  // 立即生成第一个菱形
  spawnDiamond.call(this);
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
    return;
  }
  
  // 生成随机位置（考虑菱形大小，避免超出边界）
  const padding = 50;
  const randomX = Phaser.Math.Between(padding, config.width - padding);
  const randomY = Phaser.Math.Between(padding, config.height - padding);
  
  // 创建菱形精灵
  const diamond = this.add.image(randomX, randomY, 'diamond');
  
  // 增加计数
  diamondCount++;
  
  console.log(`生成第 ${diamondCount} 个菱形，位置: (${randomX}, ${randomY})`);
}

new Phaser.Game(config);
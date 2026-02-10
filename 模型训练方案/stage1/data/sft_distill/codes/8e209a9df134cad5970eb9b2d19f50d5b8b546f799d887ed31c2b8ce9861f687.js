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
let timerEvent = null;
const MAX_DIAMONDS = 10;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形（四个顶点）
  const diamondSize = 30;
  const points = [
    { x: diamondSize, y: 0 },           // 上顶点
    { x: diamondSize * 2, y: diamondSize }, // 右顶点
    { x: diamondSize, y: diamondSize * 2 }, // 下顶点
    { x: 0, y: diamondSize }            // 左顶点
  ];
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', diamondSize * 2, diamondSize * 2);
  graphics.destroy();
  
  // 创建定时器事件，每4秒触发一次
  timerEvent = this.time.addEvent({
    delay: 4000,
    callback: spawnDiamond,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个菱形
  spawnDiamond.call(this);
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成10个菱形，停止生成');
    return;
  }
  
  // 生成随机位置（确保菱形完全在画布内）
  const padding = 30;
  const randomX = Phaser.Math.Between(padding, config.width - padding);
  const randomY = Phaser.Math.Between(padding, config.height - padding);
  
  // 创建菱形精灵
  const diamond = this.add.image(randomX, randomY, 'diamond');
  
  // 增加计数
  diamondCount++;
  
  console.log(`生成第 ${diamondCount} 个菱形，位置: (${randomX}, ${randomY})`);
}

new Phaser.Game(config);
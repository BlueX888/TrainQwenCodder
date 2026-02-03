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
  // 使用 Graphics 绘制菱形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 绘制菱形（四个点连接）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);      // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 重置计数器
  diamondCount = 0;
  
  // 创建定时器事件，每2.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
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
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
    console.log('已生成12个菱形，停止生成');
    return;
  }
  
  // 生成随机位置（考虑菱形大小，避免超出边界）
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
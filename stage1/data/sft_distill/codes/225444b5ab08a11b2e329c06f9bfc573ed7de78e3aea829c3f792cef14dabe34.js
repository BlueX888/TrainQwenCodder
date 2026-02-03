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

// 记录生成的矩形数量
let rectangleCount = 0;
const MAX_RECTANGLES = 12;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建绿色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 30);
  graphics.generateTexture('greenRect', 40, 30);
  graphics.destroy();

  // 重置计数器
  rectangleCount = 0;

  // 创建定时器事件，每 0.5 秒执行一次
  // repeat: 11 表示在首次执行后再重复 11 次，总共 12 次
  this.time.addEvent({
    delay: 500,                    // 延迟 500 毫秒（0.5 秒）
    callback: spawnRectangle,      // 回调函数
    callbackScope: this,           // 回调作用域
    loop: false,                   // 不使用无限循环
    repeat: 11                     // 重复 11 次（加上首次共 12 次）
  });

  // 立即生成第一个矩形
  spawnRectangle.call(this);
}

function spawnRectangle() {
  // 检查是否已达到最大数量
  if (rectangleCount >= MAX_RECTANGLES) {
    return;
  }

  // 生成随机位置
  // 留出边距，确保矩形完全在画布内
  const x = Phaser.Math.Between(20, 780);
  const y = Phaser.Math.Between(15, 585);

  // 创建绿色矩形精灵
  const rect = this.add.image(x, y, 'greenRect');

  // 增加计数
  rectangleCount++;

  // 在控制台输出信息（可选）
  console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);
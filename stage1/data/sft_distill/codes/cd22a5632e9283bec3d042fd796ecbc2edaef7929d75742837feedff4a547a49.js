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

// 圆形计数器
let circleCount = 0;
const MAX_CIRCLES = 15;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建定时器事件，每隔1秒执行一次
  this.time.addEvent({
    delay: 1000, // 1秒 = 1000毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    return;
  }

  // 生成随机位置
  const radius = 20; // 圆形半径
  const x = Phaser.Math.Between(radius, config.width - radius);
  const y = Phaser.Math.Between(radius, config.height - radius);

  // 创建 Graphics 对象并绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillCircle(x, y, radius);

  // 增加计数
  circleCount++;

  // 在控制台输出信息（可选）
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);
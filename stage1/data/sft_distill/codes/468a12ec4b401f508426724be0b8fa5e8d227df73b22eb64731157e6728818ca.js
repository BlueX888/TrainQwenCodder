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

let circleCount = 0;
const MAX_CIRCLES = 5;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建定时器事件，每 1.5 秒触发一次
  this.time.addEvent({
    delay: 1500, // 1.5 秒 = 1500 毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    // 停止所有定时器事件
    this.time.removeAllEvents();
    return;
  }

  // 生成随机位置
  // 留出边距，确保圆形完全在屏幕内（圆形半径为 30）
  const radius = 30;
  const x = Phaser.Math.Between(radius, 800 - radius);
  const y = Phaser.Math.Between(radius, 600 - radius);

  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(x, y, radius);

  // 增加计数
  circleCount++;

  // 在控制台输出信息（可选）
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
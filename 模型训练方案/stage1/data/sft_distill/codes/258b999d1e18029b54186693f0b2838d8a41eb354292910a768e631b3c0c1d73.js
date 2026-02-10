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
const MAX_CIRCLES = 10;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  circleCount = 0;

  // 创建定时器事件，每2.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: spawnCircle,
    callbackScope: this,
    loop: true // 循环执行
  });

  // 定义生成圆形的函数
  function spawnCircle() {
    // 检查是否已达到最大数量
    if (circleCount >= MAX_CIRCLES) {
      timerEvent.remove(); // 停止定时器
      return;
    }

    // 生成随机位置
    // 留出圆形半径的边距，避免圆形超出画布
    const radius = 30;
    const x = Phaser.Math.Between(radius, this.sys.canvas.width - radius);
    const y = Phaser.Math.Between(radius, this.sys.canvas.height - radius);

    // 创建Graphics对象并绘制绿色圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色，完全不透明
    graphics.fillCircle(x, y, radius);

    // 增加计数器
    circleCount++;

    // 在控制台输出信息（可选，用于调试）
    console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
  }
}

// 创建游戏实例
new Phaser.Game(config);
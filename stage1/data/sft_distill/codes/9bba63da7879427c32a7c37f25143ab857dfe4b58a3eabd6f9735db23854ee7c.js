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

function preload() {
  // 无需预加载资源
}

function create() {
  // 记录已生成的菱形数量
  let diamondCount = 0;
  const maxDiamonds = 3;

  // 创建定时器事件，每3秒触发一次
  this.time.addEvent({
    delay: 3000,                    // 3秒间隔
    callback: spawnDiamond,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true                      // 循环执行
  });

  // 生成菱形的函数
  function spawnDiamond() {
    // 检查是否已达到最大数量
    if (diamondCount >= maxDiamonds) {
      return;
    }

    // 生成随机位置
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);

    // 创建Graphics对象绘制菱形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色

    // 定义菱形的四个顶点（相对于中心点）
    const size = 40;
    const points = [
      0, -size,      // 上顶点
      size, 0,       // 右顶点
      0, size,       // 下顶点
      -size, 0       // 左顶点
    ];

    // 绘制菱形
    graphics.beginPath();
    graphics.moveTo(x + points[0], y + points[1]);
    graphics.lineTo(x + points[2], y + points[3]);
    graphics.lineTo(x + points[4], y + points[5]);
    graphics.lineTo(x + points[6], y + points[7]);
    graphics.closePath();
    graphics.fillPath();

    // 增加计数
    diamondCount++;

    // 添加调试信息
    console.log(`生成第 ${diamondCount} 个菱形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);
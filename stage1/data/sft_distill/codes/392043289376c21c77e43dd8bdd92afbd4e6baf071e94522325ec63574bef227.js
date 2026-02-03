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

let triangleCount = 0;
const MAX_TRIANGLES = 20;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化计数器
  triangleCount = 0;

  // 创建定时器事件，每1.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true
  });

  // 保存定时器引用以便后续移除
  this.triangleTimer = timerEvent;
}

function spawnTriangle() {
  // 检查是否达到最大数量
  if (triangleCount >= MAX_TRIANGLES) {
    this.triangleTimer.remove(); // 停止定时器
    return;
  }

  // 生成随机位置
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);

  // 创建 Graphics 对象绘制三角形
  const graphics = this.add.graphics();
  
  // 设置青色填充 (cyan)
  graphics.fillStyle(0x00ffff, 1);

  // 定义三角形的三个顶点（相对于中心点）
  const size = 30;
  const triangle = new Phaser.Geom.Triangle(
    0, -size,           // 顶点
    -size, size,        // 左下
    size, size          // 右下
  );

  // 绘制三角形
  graphics.fillTriangleShape(triangle);

  // 设置位置
  graphics.setPosition(x, y);

  // 增加计数
  triangleCount++;

  // 在控制台输出进度
  console.log(`生成第 ${triangleCount} 个三角形，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);
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

function preload() {
  // 无需预加载资源
}

function create() {
  // 重置计数器
  diamondCount = 0;

  // 创建定时器事件，每 3 秒生成一个菱形
  this.time.addEvent({
    delay: 3000,                    // 3 秒间隔
    callback: spawnDiamond,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: MAX_DIAMONDS - 1        // 重复 11 次（加上首次共 12 次）
  });

  // 立即生成第一个菱形
  spawnDiamond.call(this);
}

function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    return;
  }

  // 生成随机位置（留出边距）
  const margin = 50;
  const x = Phaser.Math.Between(margin, 800 - margin);
  const y = Phaser.Math.Between(margin, 600 - margin);

  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);

  // 定义菱形的四个顶点（相对于中心点）
  const size = 30;
  const points = [
    { x: x, y: y - size },          // 上顶点
    { x: x + size, y: y },          // 右顶点
    { x: x, y: y + size },          // 下顶点
    { x: x - size, y: y }           // 左顶点
  ];

  // 绘制菱形
  graphics.fillPoints(points, true);

  // 增加计数
  diamondCount++;

  // 在控制台输出信息
  console.log(`生成第 ${diamondCount} 个菱形，位置: (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
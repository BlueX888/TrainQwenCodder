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

// 菱形计数器
let diamondCount = 0;
const MAX_DIAMONDS = 10;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  diamondCount = 0;
  
  // 创建定时器事件，每4秒执行一次
  this.time.addEvent({
    delay: 4000, // 4秒 = 4000毫秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 立即生成第一个菱形
  spawnDiamond.call(this);
}

/**
 * 生成白色菱形
 */
function spawnDiamond() {
  // 检查是否已达到最大数量
  if (diamondCount >= MAX_DIAMONDS) {
    console.log('已达到最大菱形数量：' + MAX_DIAMONDS);
    return;
  }
  
  // 菱形尺寸
  const size = 40;
  
  // 随机位置（考虑边界，留出菱形尺寸的空间）
  const x = Phaser.Math.Between(size, this.scale.width - size);
  const y = Phaser.Math.Between(size, this.scale.height - size);
  
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xffffff, 1); // 白色边框
  graphics.fillStyle(0xffffff, 1);    // 白色填充
  
  // 菱形的四个顶点（相对于中心点）
  const points = [
    { x: x, y: y - size },      // 上顶点
    { x: x + size, y: y },      // 右顶点
    { x: x, y: y + size },      // 下顶点
    { x: x - size, y: y }       // 左顶点
  ];
  
  // 绘制菱形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 增加计数
  diamondCount++;
  
  console.log(`生成第 ${diamondCount} 个菱形，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);
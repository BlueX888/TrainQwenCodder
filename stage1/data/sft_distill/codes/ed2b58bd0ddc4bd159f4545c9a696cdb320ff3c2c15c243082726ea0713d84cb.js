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

let hexagonCount = 0;
const MAX_HEXAGONS = 3;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  hexagonCount = 0;

  // 创建定时器事件，每2秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 2000,                // 2秒
    callback: spawnHexagon,     // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });

  // 保存定时器引用以便后续停止
  this.hexagonTimer = timerEvent;
}

function spawnHexagon() {
  // 检查是否已达到最大数量
  if (hexagonCount >= MAX_HEXAGONS) {
    this.hexagonTimer.remove();  // 停止定时器
    console.log('已生成3个六边形，停止生成');
    return;
  }

  // 生成随机位置（考虑六边形半径，避免超出边界）
  const radius = 40;
  const x = Phaser.Math.Between(radius + 20, 800 - radius - 20);
  const y = Phaser.Math.Between(radius + 20, 600 - radius - 20);

  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9b59b6, 1);
  
  // 计算正六边形的6个顶点坐标
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(px, py);
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
  
  // 添加描边使六边形更明显
  graphics.lineStyle(3, 0x8e44ad, 1);
  graphics.strokePoints(points, true);

  // 增加计数
  hexagonCount++;
  console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
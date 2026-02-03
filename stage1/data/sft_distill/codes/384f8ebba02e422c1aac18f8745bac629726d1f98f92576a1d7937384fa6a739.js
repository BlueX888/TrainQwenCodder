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
let maxHexagons = 10;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  // 重置计数器
  hexagonCount = 0;
  
  // 创建定时器事件，每2秒执行一次
  timerEvent = this.time.addEvent({
    delay: 2000,                // 2秒
    callback: spawnHexagon,     // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });
  
  // 立即生成第一个六边形
  spawnHexagon.call(this);
}

function spawnHexagon() {
  // 检查是否已达到最大数量
  if (hexagonCount >= maxHexagons) {
    timerEvent.remove();  // 停止定时器
    return;
  }
  
  // 生成随机位置（确保六边形完全在画布内）
  const radius = 30;
  const x = Phaser.Math.Between(radius + 10, config.width - radius - 10);
  const y = Phaser.Math.Between(radius + 10, config.height - radius - 10);
  
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    points.push(px, py);
  }
  
  // 绘制六边形
  graphics.fillPoints(points, true);
  
  // 添加描边使六边形更清晰
  graphics.lineStyle(2, 0xffdd00, 1);
  graphics.strokePoints(points, true);
  
  // 计数器增加
  hexagonCount++;
  
  // 在控制台输出生成信息
  console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
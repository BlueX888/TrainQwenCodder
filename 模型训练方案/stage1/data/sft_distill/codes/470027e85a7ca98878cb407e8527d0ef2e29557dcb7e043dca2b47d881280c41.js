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
const MAX_HEXAGONS = 15;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  // 重置计数器
  hexagonCount = 0;
  
  // 创建定时器，每4秒生成一个六边形
  timerEvent = this.time.addEvent({
    delay: 4000,           // 4秒间隔
    callback: spawnHexagon,
    callbackScope: this,
    loop: true             // 循环执行
  });
  
  // 立即生成第一个六边形
  spawnHexagon.call(this);
}

function spawnHexagon() {
  // 检查是否已达到最大数量
  if (hexagonCount >= MAX_HEXAGONS) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置（留出边距以确保六边形完全显示）
  const margin = 50;
  const x = Phaser.Math.Between(margin, 800 - margin);
  const y = Phaser.Math.Between(margin, 600 - margin);
  
  // 创建六边形
  createHexagon(this, x, y, 30);
  
  // 增加计数
  hexagonCount++;
  
  // 在控制台输出当前生成数量
  console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
}

function createHexagon(scene, x, y, radius) {
  // 计算六边形的6个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(px, py));
  }
  
  // 创建 Graphics 对象绘制六边形
  const graphics = scene.add.graphics();
  graphics.setPosition(x, y);
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使六边形更清晰
  graphics.lineStyle(2, 0xffaa00, 1);
  graphics.strokePath();
}

new Phaser.Game(config);
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
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  hexagonCount = 0;
  
  // 创建定时器，每2秒生成一个六边形
  timerEvent = this.time.addEvent({
    delay: 2000,                // 2秒间隔
    callback: createHexagon,    // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });
  
  // 立即生成第一个六边形
  createHexagon.call(this);
}

function createHexagon() {
  // 检查是否已达到最大数量
  if (hexagonCount >= 10) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置（留出边距避免六边形被截断）
  const margin = 50;
  const x = Phaser.Math.Between(margin, 800 - margin);
  const y = Phaser.Math.Between(margin, 600 - margin);
  
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 计算六边形的六个顶点（半径30像素）
  const radius = 30;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    hexPoints.push(px, py);
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(hexPoints, true);
  
  // 增加计数
  hexagonCount++;
  
  // 在控制台输出提示信息
  console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let hexagonCount = 0;
const MAX_HEXAGONS = 15;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFD700, 1); // 黄色
  
  // 计算六边形的顶点（半径30）
  const radius = 30;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillPoints(hexagonPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建定时器事件，每4秒触发一次
  timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnHexagon,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个六边形
  spawnHexagon.call(this);
}

function spawnHexagon() {
  // 检查是否已达到最大数量
  if (hexagonCount >= MAX_HEXAGONS) {
    if (timerEvent) {
      timerEvent.remove(); // 移除定时器
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置（避免贴边，留出30像素边距）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建六边形精灵
  const hexagon = this.add.image(x, y, 'hexagon');
  
  // 添加简单的缩放动画效果
  hexagon.setScale(0);
  this.tweens.add({
    targets: hexagon,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  hexagonCount++;
  
  // 在控制台输出当前数量
  console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
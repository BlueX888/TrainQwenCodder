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
const MAX_HEXAGONS = 8;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用Graphics绘制六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点（半径30像素）
  const hexRadius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    hexPoints.push(x, y);
  }
  
  // 绘制紫色六边形
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillPoints(hexPoints, true);
  graphics.lineStyle(2, 0x7744dd, 1); // 深紫色边框
  graphics.strokePoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建定时器事件，每500ms触发一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒
    callback: spawnHexagon,
    callbackScope: this,
    loop: true
  });
}

function spawnHexagon() {
  // 检查是否已达到最大数量
  if (hexagonCount >= MAX_HEXAGONS) {
    // 停止并移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置（留出边距避免六边形超出边界）
  const margin = 40;
  const randomX = Phaser.Math.Between(margin, 800 - margin);
  const randomY = Phaser.Math.Between(margin, 600 - margin);
  
  // 创建六边形sprite
  const hexagon = this.add.image(randomX, randomY, 'hexagon');
  
  // 添加简单的缩放动画效果
  hexagon.setScale(0);
  this.tweens.add({
    targets: hexagon,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
  
  // 增加计数器
  hexagonCount++;
  
  // 在控制台输出当前数量（可选）
  console.log(`生成第 ${hexagonCount} 个六边形`);
}

new Phaser.Game(config);
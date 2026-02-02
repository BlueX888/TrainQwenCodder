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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建青色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点（半径为30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00cccc, 1); // 深青色边框
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建定时器，每0.5秒生成一个六边形
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: spawnHexagon,
    callbackScope: this,
    loop: true
  });
}

function spawnHexagon() {
  // 检查是否已经生成了15个
  if (hexagonCount >= MAX_HEXAGONS) {
    timerEvent.remove(); // 停止定时器
    return;
  }
  
  // 生成随机位置（确保六边形完全在画布内）
  const margin = 40; // 留出边距
  const randomX = Phaser.Math.Between(margin, config.width - margin);
  const randomY = Phaser.Math.Between(margin, config.height - margin);
  
  // 创建六边形精灵
  const hexagon = this.add.image(randomX, randomY, 'hexagon');
  
  // 添加一个简单的缩放动画效果
  hexagon.setScale(0);
  this.tweens.add({
    targets: hexagon,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
  
  hexagonCount++;
  
  // 在控制台输出进度
  console.log(`生成第 ${hexagonCount} 个六边形，位置: (${randomX}, ${randomY})`);
}

new Phaser.Game(config);
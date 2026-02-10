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

let diamonds = [];

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 定义菱形的四个顶点（中心在原点）
  const diamondPoints = [
    { x: 0, y: -30 },   // 上顶点
    { x: 25, y: 0 },    // 右顶点
    { x: 0, y: 30 },    // 下顶点
    { x: -25, y: 0 }    // 左顶点
  ];
  
  // 绘制菱形
  graphics.beginPath();
  graphics.moveTo(diamondPoints[0].x, diamondPoints[0].y);
  for (let i = 1; i < diamondPoints.length; i++) {
    graphics.lineTo(diamondPoints[i].x, diamondPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理（60x60 像素，菱形居中）
  graphics.generateTexture('diamond', 60, 60);
  graphics.destroy();
  
  // 创建定时器，每1.5秒生成一个菱形
  this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个菱形
  spawnDiamond.call(this);
}

function spawnDiamond() {
  // 检查当前菱形数量
  if (diamonds.length >= 3) {
    return; // 已达到最大数量，不再生成
  }
  
  // 生成随机位置（确保菱形完全在画布内）
  const margin = 40; // 边距
  const randomX = Phaser.Math.Between(margin, config.width - margin);
  const randomY = Phaser.Math.Between(margin, config.height - margin);
  
  // 创建菱形精灵
  const diamond = this.add.sprite(randomX, randomY, 'diamond');
  
  // 添加到数组中
  diamonds.push(diamond);
  
  console.log(`菱形已生成，当前数量: ${diamonds.length}`);
}

new Phaser.Game(config);
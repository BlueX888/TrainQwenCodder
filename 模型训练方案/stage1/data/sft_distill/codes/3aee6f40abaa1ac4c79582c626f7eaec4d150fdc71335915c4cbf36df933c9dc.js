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

function preload() {
  // 无需预加载资源
}

function create() {
  // 六边形计数器
  let hexagonCount = 0;
  const maxHexagons = 15;
  
  // 创建定时器，每4秒执行一次，重复14次（加上第一次共15次）
  this.time.addEvent({
    delay: 4000,
    callback: spawnHexagon,
    callbackScope: this,
    repeat: maxHexagons - 1
  });
  
  // 生成六边形的函数
  function spawnHexagon() {
    hexagonCount++;
    
    // 生成随机位置（留出边距避免六边形超出屏幕）
    const margin = 40;
    const x = Phaser.Math.Between(margin, 800 - margin);
    const y = Phaser.Math.Between(margin, 600 - margin);
    
    // 创建 Graphics 对象绘制六边形
    const graphics = this.add.graphics();
    
    // 设置黄色填充
    graphics.fillStyle(0xffff00, 1);
    
    // 六边形半径
    const radius = 30;
    
    // 计算六边形的六个顶点坐标（正六边形，顶点在正上方）
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点在上方
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      points.push(px, py);
    }
    
    // 绘制填充的六边形
    graphics.fillPoints(points, true);
    
    // 添加描边使六边形更清晰
    graphics.lineStyle(2, 0xffa500, 1);
    graphics.strokePoints(points, true);
    
    console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);
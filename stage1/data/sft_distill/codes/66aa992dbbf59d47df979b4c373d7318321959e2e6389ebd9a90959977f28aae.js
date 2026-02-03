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
  // 计数器，记录已生成的六边形数量
  let hexagonCount = 0;
  const maxHexagons = 3;
  
  // 创建定时器事件，每2秒触发一次，重复2次（总共触发3次）
  this.time.addEvent({
    delay: 2000,           // 2秒
    callback: spawnHexagon,
    callbackScope: this,
    repeat: 2              // 重复2次，加上首次共3次
  });
  
  // 生成六边形的函数
  function spawnHexagon() {
    if (hexagonCount >= maxHexagons) {
      return;
    }
    
    // 随机位置（留出边距避免六边形超出边界）
    const margin = 50;
    const x = Phaser.Math.Between(margin, config.width - margin);
    const y = Phaser.Math.Between(margin, config.height - margin);
    
    // 六边形半径
    const radius = 40;
    
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9b59b6, 1);
    
    // 计算六边形的6个顶点
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      points.push(new Phaser.Geom.Point(px, py));
    }
    
    // 绘制六边形
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 添加描边使六边形更明显
    graphics.lineStyle(2, 0x8e44ad, 1);
    graphics.strokePath();
    
    hexagonCount++;
    
    console.log(`生成第 ${hexagonCount} 个六边形，位置: (${x}, ${y})`);
  }
  
  // 添加提示文本
  this.add.text(10, 10, '每2秒生成一个紫色六边形\n最多生成3个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
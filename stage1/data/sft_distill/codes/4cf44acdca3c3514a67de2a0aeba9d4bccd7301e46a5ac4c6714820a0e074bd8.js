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
  // 无需预加载外部资源
}

function create() {
  // 六边形计数器
  let hexagonCount = 0;
  const maxHexagons = 5;
  const hexagonRadius = 40; // 六边形半径
  
  // 创建定时器，每隔4秒生成一个六边形
  this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnHexagon,
    callbackScope: this,
    repeat: maxHexagons - 1, // 重复4次，加上第一次共5次
    loop: false
  });
  
  // 生成六边形的函数
  function spawnHexagon() {
    hexagonCount++;
    
    // 生成随机位置（考虑边界，避免六边形超出屏幕）
    const margin = hexagonRadius + 10;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin, config.height - margin);
    
    // 创建 Graphics 对象绘制六边形
    const graphics = this.add.graphics();
    
    // 设置青色填充
    graphics.fillStyle(0x00ffff, 1);
    
    // 绘制六边形
    drawHexagon(graphics, randomX, randomY, hexagonRadius);
    
    // 添加文本标签显示是第几个六边形
    this.add.text(randomX, randomY, hexagonCount.toString(), {
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    console.log(`生成第 ${hexagonCount} 个六边形，位置: (${randomX}, ${randomY})`);
  }
  
  // 绘制六边形的辅助函数
  function drawHexagon(graphics, x, y, radius) {
    graphics.beginPath();
    
    // 计算六边形的六个顶点
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i; // 每个角度60度
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      
      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    
    graphics.closePath();
    graphics.fillPath();
  }
  
  // 添加提示文本
  this.add.text(10, 10, '每隔4秒生成一个青色六边形\n最多生成5个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
}

new Phaser.Game(config);
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
  // 用于跟踪已生成的六边形数量
  let hexagonCount = 0;
  const maxHexagons = 5;

  // 创建六边形的函数
  const createHexagon = (x, y, radius, color) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    
    // 绘制六边形（6个顶点）
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i; // 60度间隔
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
    
    return graphics;
  };

  // 创建定时器事件，每4秒触发一次
  this.time.addEvent({
    delay: 4000, // 4秒
    callback: () => {
      if (hexagonCount < maxHexagons) {
        // 生成随机位置（留出边距避免六边形超出边界）
        const margin = 50;
        const randomX = Phaser.Math.Between(margin, config.width - margin);
        const randomY = Phaser.Math.Between(margin, config.height - margin);
        
        // 创建青色六边形（cyan: 0x00ffff）
        const radius = 30;
        createHexagon(randomX, randomY, radius, 0x00ffff);
        
        hexagonCount++;
        
        console.log(`生成第 ${hexagonCount} 个六边形，位置: (${randomX}, ${randomY})`);
      }
    },
    callbackScope: this,
    loop: true, // 循环执行
    repeat: 4 // 重复4次（加上首次执行共5次）
  });

  // 添加提示文本
  this.add.text(10, 10, '每4秒生成一个青色六边形\n最多生成5个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
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
  // 使用 Graphics 生成青色六边形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00cccc, 1); // 深青色边框
  
  // 计算六边形顶点（半径 30）
  const radius = 30;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  const points = [];
  
  for (let i = 0; i < sides; i++) {
    const x = radius + Math.cos(angle * i - Math.PI / 2) * radius;
    const y = radius + Math.sin(angle * i - Math.PI / 2) * radius;
    points.push(x, y);
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    graphics.lineTo(points[i], points[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 六边形计数器
  let hexagonCount = 0;
  const maxHexagons = 15;
  
  // 创建定时器事件，每 0.5 秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: () => {
      if (hexagonCount < maxHexagons) {
        // 生成随机位置（确保六边形完全在画布内）
        const margin = radius;
        const randomX = Phaser.Math.Between(margin, config.width - margin);
        const randomY = Phaser.Math.Between(margin, config.height - margin);
        
        // 创建六边形精灵
        const hexagon = this.add.image(randomX, randomY, 'hexagon');
        
        // 添加简单的缩放动画
        this.tweens.add({
          targets: hexagon,
          scale: { from: 0, to: 1 },
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        hexagonCount++;
        
        // 达到最大数量时移除定时器
        if (hexagonCount >= maxHexagons) {
          timerEvent.remove();
          
          // 显示完成文本
          const text = this.add.text(
            config.width / 2,
            config.height - 50,
            '已生成 15 个六边形',
            {
              fontSize: '24px',
              color: '#00ffff',
              fontFamily: 'Arial'
            }
          );
          text.setOrigin(0.5);
        }
      }
    },
    loop: true // 循环执行
  });
  
  // 显示计数文本
  const countText = this.add.text(
    10,
    10,
    '六边形数量: 0 / 15',
    {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  
  // 更新计数文本
  this.time.addEvent({
    delay: 100,
    callback: () => {
      countText.setText(`六边形数量: ${hexagonCount} / 15`);
    },
    loop: true
  });
}

new Phaser.Game(config);
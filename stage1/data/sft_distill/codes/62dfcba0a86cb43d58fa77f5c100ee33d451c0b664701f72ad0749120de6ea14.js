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
const MAX_HEXAGONS = 20;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径为30）
  const radius = 30;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制蓝色六边形
  graphics.fillStyle(0x3498db, 1); // 蓝色
  graphics.lineStyle(2, 0x2980b9, 1); // 深蓝色边框
  graphics.beginPath();
  graphics.moveTo(hexagonPoints[0], hexagonPoints[1]);
  for (let i = 2; i < hexagonPoints.length; i += 2) {
    graphics.lineTo(hexagonPoints[i], hexagonPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建定时器，每2秒生成一个六边形
  const timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建六边形精灵
      const hexagon = this.add.image(x, y, 'hexagon');
      
      // 添加简单的缩放动画
      this.tweens.add({
        targets: hexagon,
        scale: { from: 0, to: 1 },
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      hexagonCount++;
      
      // 达到最大数量时移除定时器
      if (hexagonCount >= MAX_HEXAGONS) {
        timerEvent.remove();
        
        // 显示完成文本
        const text = this.add.text(400, 300, '已生成20个六边形！', {
          fontSize: '32px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        });
        text.setOrigin(0.5);
      }
    },
    loop: true
  });
  
  // 显示计数器
  const counterText = this.add.text(10, 10, '六边形数量: 0 / 20', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 更新计数器显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      counterText.setText(`六边形数量: ${hexagonCount} / 20`);
    },
    loop: true
  });
}

new Phaser.Game(config);
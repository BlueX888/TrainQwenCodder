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
  // 使用 Graphics 绘制青色六边形并生成纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径为30）
  const radius = 30;
  const sides = 6;
  const points = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0xffffff, 1); // 白色边框
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 六边形计数器
  let hexagonCount = 0;
  const maxHexagons = 10;
  
  // 创建定时器事件，每0.5秒生成一个六边形
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建六边形精灵
      const hexagon = this.add.image(x, y, 'hexagon');
      
      // 添加简单的缩放动画效果
      hexagon.setScale(0);
      this.tweens.add({
        targets: hexagon,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
      
      hexagonCount++;
      
      // 达到10个后移除定时器
      if (hexagonCount >= maxHexagons) {
        timerEvent.remove();
      }
    },
    loop: true
  });
  
  // 添加提示文本
  const text = this.add.text(10, 10, 'Hexagons: 0/10', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 更新文本显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      text.setText(`Hexagons: ${hexagonCount}/10`);
    },
    loop: true
  });
}

new Phaser.Game(config);
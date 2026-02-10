const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径为30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00cccc, 1); // 深青色边框
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 六边形计数器
  let hexagonCount = 0;
  const maxHexagons = 5;
  
  // 创建定时器事件，每4秒生成一个六边形
  const timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: () => {
      // 生成随机位置（确保六边形完全在画布内）
      const margin = radius;
      const x = Phaser.Math.Between(margin, config.width - margin);
      const y = Phaser.Math.Between(margin, config.height - margin);
      
      // 创建六边形精灵
      const hexagon = this.add.image(x, y, 'hexagon');
      
      // 添加简单的缩放动画效果
      hexagon.setScale(0);
      this.tweens.add({
        targets: hexagon,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      hexagonCount++;
      
      // 如果达到最大数量，移除定时器
      if (hexagonCount >= maxHexagons) {
        timerEvent.remove();
        console.log('已生成5个六边形，定时器已停止');
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 添加提示文本
  const text = this.add.text(10, 10, '每4秒生成一个青色六边形\n最多生成5个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
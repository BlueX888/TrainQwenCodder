const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制绿色星形
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0x00aa00, 1);
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push({
      x: 40 + Math.cos(angle) * radius,
      y: 40 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  graphics.destroy();
  
  // 记录已生成的星形数量
  let starCount = 0;
  const maxStars = 3;
  
  // 创建定时器事件，每0.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: () => {
      // 检查是否已达到最大数量
      if (starCount < maxStars) {
        // 在随机位置生成星形
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        const star = this.add.image(x, y, 'star');
        star.setScale(1);
        
        // 添加简单的出现动画
        star.setAlpha(0);
        this.tweens.add({
          targets: star,
          alpha: 1,
          scale: 1.2,
          duration: 200,
          yoyo: true,
          ease: 'Sine.easeInOut'
        });
        
        starCount++;
        
        console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
        
        // 如果达到最大数量，移除定时器
        if (starCount >= maxStars) {
          timerEvent.remove();
          console.log('已生成3个星形，定时器已停止');
        }
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每0.5秒生成一个绿色星形\n最多生成3个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
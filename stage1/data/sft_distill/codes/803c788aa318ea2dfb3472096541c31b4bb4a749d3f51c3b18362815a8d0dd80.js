const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 程序化生成绿色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制绿色星形
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0x00aa00, 1);
  
  // 绘制五角星
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('greenStar', 64, 64);
  graphics.destroy();
}

function create() {
  // 记录已生成的星形数量
  let starCount = 0;
  const maxStars = 3;
  
  // 创建定时器事件，每 0.5 秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: () => {
      if (starCount < maxStars) {
        // 生成随机位置
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        // 创建星形精灵
        const star = this.add.image(x, y, 'greenStar');
        star.setScale(1);
        
        // 添加简单的出现动画
        star.setAlpha(0);
        this.tweens.add({
          targets: star,
          alpha: 1,
          duration: 200,
          ease: 'Power2'
        });
        
        starCount++;
        
        // 如果达到最大数量，移除定时器
        if (starCount >= maxStars) {
          timerEvent.remove();
        }
      }
    },
    loop: true
  });
  
  // 添加提示文字
  this.add.text(10, 10, '每 0.5 秒生成一个绿色星形（最多 3 个）', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
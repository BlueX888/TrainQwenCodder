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
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffd700, 1); // 金色边框
  
  // 绘制五角星路径
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 25;
  const innerRadius = 10;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
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
  graphics.generateTexture('star', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 星形计数器
  let starCount = 0;
  const maxStars = 12;
  
  // 创建定时器事件，每2秒生成一个星形
  const timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: () => {
      // 检查是否已达到最大数量
      if (starCount >= maxStars) {
        timerEvent.remove(); // 停止定时器
        return;
      }
      
      // 在随机位置生成星形
      const randomX = Phaser.Math.Between(50, 750);
      const randomY = Phaser.Math.Between(50, 550);
      
      const star = this.add.image(randomX, randomY, 'star');
      
      // 添加简单的缩放动画效果
      star.setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      starCount++;
      
      // 在控制台输出进度
      console.log(`生成第 ${starCount} 个星形，位置: (${randomX}, ${randomY})`);
    },
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 显示提示文本
  const text = this.add.text(10, 10, '每2秒生成一个星形 (最多12个)', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
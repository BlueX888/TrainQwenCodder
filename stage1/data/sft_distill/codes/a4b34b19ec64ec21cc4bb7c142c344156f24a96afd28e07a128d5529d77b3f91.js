const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用Graphics绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形（五角星）
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 25;
  const innerRadius = 10;
  const points = 5;
  
  // 计算星形的各个顶点
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
  
  // 记录已生成的星形数量
  let starCount = 0;
  const maxStars = 12;
  
  // 创建定时器事件，每2秒生成一个星形
  const timerEvent = this.time.addEvent({
    delay: 2000,           // 2秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 添加星形图像
      const star = this.add.image(x, y, 'star');
      
      // 添加一些动画效果（缩放动画）
      star.setScale(0);
      this.tweens.add({
        targets: star,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      // 增加计数
      starCount++;
      
      // 达到最大数量后移除定时器
      if (starCount >= maxStars) {
        timerEvent.remove();
        console.log('已生成12个星形，停止生成');
      }
    },
    callbackScope: this,
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  const text = this.add.text(10, 10, '星形数量: 0 / 12', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 更新文本显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      text.setText(`星形数量: ${starCount} / ${maxStars}`);
    },
    loop: true
  });
}

new Phaser.Game(config);
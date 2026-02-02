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
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 12;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
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
  
  // 星形计数器
  let starCount = 0;
  const maxStars = 12;
  
  // 创建定时器事件，每2秒生成一个星形
  const timerEvent = this.time.addEvent({
    delay: 2000,                    // 2秒
    callback: spawnStar,            // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true                      // 循环执行
  });
  
  // 生成星形的函数
  function spawnStar() {
    if (starCount >= maxStars) {
      // 达到最大数量，移除定时器
      timerEvent.remove();
      console.log('已生成12个星形，停止生成');
      return;
    }
    
    // 生成随机位置（确保星形完全在画布内）
    const x = Phaser.Math.Between(40, 760);
    const y = Phaser.Math.Between(40, 560);
    
    // 创建星形图像
    const star = this.add.image(x, y, 'star');
    
    // 添加简单的缩放动画效果
    star.setScale(0);
    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    starCount++;
    console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
  }
  
  // 添加提示文本
  const text = this.add.text(10, 10, '每2秒生成一个黄色星形\n最多生成12个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

// 创建游戏实例
new Phaser.Game(config);
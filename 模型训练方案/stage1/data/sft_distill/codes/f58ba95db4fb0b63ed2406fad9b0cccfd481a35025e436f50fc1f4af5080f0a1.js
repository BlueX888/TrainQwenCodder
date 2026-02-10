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
  // 星形计数器
  let starCount = 0;
  const maxStars = 12;
  
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffd700, 1); // 金色边框
  
  // 星形参数
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 15;
  const points = 5;
  
  // 绘制星形路径
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
  graphics.generateTexture('star', 64, 64);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建定时器事件，每隔2秒生成一个星形
  const timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: generateStar,
    callbackScope: this,
    loop: true
  });
  
  // 生成星形的函数
  function generateStar() {
    if (starCount >= maxStars) {
      // 达到最大数量，停止定时器
      timerEvent.remove();
      console.log('已生成12个星形，停止生成');
      return;
    }
    
    // 随机位置（确保星形完全在画布内）
    const x = Phaser.Math.Between(32, 768);
    const y = Phaser.Math.Between(32, 568);
    
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
  
  // 添加文本显示当前星形数量
  const text = this.add.text(10, 10, '星形数量: 0 / 12', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 更新文本的定时器
  this.time.addEvent({
    delay: 100,
    callback: () => {
      text.setText(`星形数量: ${starCount} / ${maxStars}`);
    },
    loop: true
  });
}

new Phaser.Game(config);
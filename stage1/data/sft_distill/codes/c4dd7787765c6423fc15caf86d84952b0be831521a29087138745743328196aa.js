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

let starCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制五角星
  const points = [];
  const outerRadius = 25;
  const innerRadius = 10;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius + 25,
      y: Math.sin(angle) * radius + 25
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
  
  // 添加标题文本
  this.add.text(400, 30, '橙色星形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 60, '每秒生成一个，最多10个', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
  
  // 显示计数器
  const countText = this.add.text(400, 570, '已生成: 0 / 10', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每隔1秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: () => {
      if (starCount < 10) {
        // 生成随机位置（避免边缘）
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(100, 500);
        
        // 创建星形精灵
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
        countText.setText(`已生成: ${starCount} / 10`);
        
        // 达到10个后停止定时器
        if (starCount >= 10) {
          timerEvent.remove();
          
          // 显示完成提示
          this.add.text(400, 90, '✓ 生成完成！', {
            fontSize: '16px',
            color: '#00ff00'
          }).setOrigin(0.5);
        }
      }
    },
    loop: true // 循环执行
  });
}

new Phaser.Game(config);
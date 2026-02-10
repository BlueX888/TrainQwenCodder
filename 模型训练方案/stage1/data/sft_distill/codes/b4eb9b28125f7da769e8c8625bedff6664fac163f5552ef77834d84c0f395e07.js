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
const MAX_STARS = 15;
let timerEvent = null;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形路径
  const points = [];
  const outerRadius = 25;
  const innerRadius = 12;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 25 + Math.cos(angle) * radius,
      y: 25 + Math.sin(angle) * radius
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
  graphics.generateTexture('cyanStar', 50, 50);
  graphics.destroy();
  
  // 显示计数器
  const counterText = this.add.text(10, 10, 'Stars: 0 / 15', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每隔4秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 在随机位置生成星形
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        const star = this.add.image(x, y, 'cyanStar');
        
        // 添加简单的缩放动画效果
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        starCount++;
        counterText.setText(`Stars: ${starCount} / ${MAX_STARS}`);
        
        // 达到最大数量后移除定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          
          // 显示完成提示
          const completeText = this.add.text(400, 300, 'All stars generated!', {
            fontSize: '32px',
            color: '#00ffff',
            fontStyle: 'bold'
          });
          completeText.setOrigin(0.5);
          
          // 完成提示闪烁效果
          this.tweens.add({
            targets: completeText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
          });
        }
      }
    },
    loop: true
  });
}

new Phaser.Game(config);
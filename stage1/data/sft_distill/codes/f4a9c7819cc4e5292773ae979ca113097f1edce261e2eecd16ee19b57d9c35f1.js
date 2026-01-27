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
const MAX_STARS = 12;

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
  const innerRadius = 15;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
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
  
  // 添加计数文本显示
  const countText = this.add.text(10, 10, `Stars: 0 / ${MAX_STARS}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 创建定时器事件，每2秒生成一个星形
  this.time.addEvent({
    delay: 2000, // 2秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 生成随机位置
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        // 添加星形图像
        const star = this.add.image(x, y, 'star');
        
        // 添加缩放动画效果
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        // 增加计数
        starCount++;
        countText.setText(`Stars: ${starCount} / ${MAX_STARS}`);
        
        // 如果达到最大数量，显示完成消息
        if (starCount === MAX_STARS) {
          this.add.text(400, 300, 'All Stars Generated!', {
            fontSize: '32px',
            color: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
          }).setOrigin(0.5);
        }
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
}

new Phaser.Game(config);
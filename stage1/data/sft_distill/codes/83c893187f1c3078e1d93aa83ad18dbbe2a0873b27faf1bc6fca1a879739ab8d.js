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
const MAX_STARS = 8;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00ffff, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 25;
  const innerRadius = 12;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: 25 + Math.cos(angle) * radius,
      y: 25 + Math.sin(angle) * radius
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
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
  
  // 创建定时器事件，每1.5秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 在随机位置生成星形
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        const star = this.add.image(x, y, 'star');
        star.setScale(0.8);
        
        // 添加简单的淡入动画效果
        star.setAlpha(0);
        this.tweens.add({
          targets: star,
          alpha: 1,
          duration: 300,
          ease: 'Power2'
        });
        
        starCount++;
        
        console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
        
        // 达到最大数量时移除定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          console.log('已生成8个星形，停止生成');
        }
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 显示提示文本
  const text = this.add.text(10, 10, '每1.5秒生成一个青色星形（最多8个）', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
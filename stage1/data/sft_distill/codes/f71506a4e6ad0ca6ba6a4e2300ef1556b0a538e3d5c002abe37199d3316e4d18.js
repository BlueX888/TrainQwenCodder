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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制一个星形路径
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 15;
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
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 添加提示文本
  const text = this.add.text(10, 10, 'Stars: 0 / 15', {
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
        
        const star = this.add.image(x, y, 'star');
        star.setScale(0.8);
        
        // 添加一个简单的缩放动画效果
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        starCount++;
        text.setText(`Stars: ${starCount} / ${MAX_STARS}`);
        
        // 如果达到最大数量，移除定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          text.setText(`Stars: ${starCount} / ${MAX_STARS} (Complete!)`);
        }
      }
    },
    loop: true
  });
}

new Phaser.Game(config);
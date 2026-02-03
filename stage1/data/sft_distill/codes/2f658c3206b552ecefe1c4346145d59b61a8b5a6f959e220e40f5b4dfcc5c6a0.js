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
const MAX_STARS = 10;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制五角星
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.lineStyle(2, 0xFF8C00, 1); // 深橙色边框
  
  // 五角星的顶点坐标（中心在 32, 32，半径为 30）
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
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 添加文本提示
  const text = this.add.text(10, 10, 'Stars: 0 / 10', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每隔1秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 在随机位置生成星形
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
        const star = this.add.image(x, y, 'star');
        star.setScale(1);
        
        // 添加简单的缩放动画效果
        this.tweens.add({
          targets: star,
          scale: { from: 0, to: 1 },
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        starCount++;
        text.setText(`Stars: ${starCount} / ${MAX_STARS}`);
        
        // 如果达到最大数量，停止定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          text.setText(`Stars: ${starCount} / ${MAX_STARS} - Complete!`);
        }
      }
    },
    loop: true
  });
}

new Phaser.Game(config);
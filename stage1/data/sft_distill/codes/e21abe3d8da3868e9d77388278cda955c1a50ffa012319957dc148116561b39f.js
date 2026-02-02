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
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffa500, 1); // 橙色描边
  
  // 绘制五角星
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 20;
  const innerRadius = 8;
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
  
  // 添加提示文本
  const text = this.add.text(10, 10, 'Stars: 0 / 12', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每2秒执行一次
  timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 生成随机位置
        const randomX = Phaser.Math.Between(50, 750);
        const randomY = Phaser.Math.Between(50, 550);
        
        // 添加星形图像
        const star = this.add.image(randomX, randomY, 'star');
        
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
        text.setText(`Stars: ${starCount} / ${MAX_STARS}`);
        
        // 如果达到最大数量，移除定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          text.setText(`Stars: ${starCount} / ${MAX_STARS} - Complete!`);
        }
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
}

new Phaser.Game(config);
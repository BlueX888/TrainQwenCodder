const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let starCount = 0;
const MAX_STARS = 12;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用Graphics绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 星形的5个顶点
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    points.push({
      x: 40 + Math.cos(angle) * radius,
      y: 40 + Math.sin(angle) * radius
    });
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  graphics.destroy();
  
  // 添加标题文本
  this.add.text(400, 30, '每2秒生成一个星形，最多12个', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数器文本
  const counterText = this.add.text(400, 70, `星形数量: 0 / ${MAX_STARS}`, {
    fontSize: '20px',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每2秒生成一个星形
  const timerEvent = this.time.addEvent({
    delay: 2000,                    // 2秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 生成随机位置（避免太靠近边缘）
        const x = Phaser.Math.Between(80, 720);
        const y = Phaser.Math.Between(120, 520);
        
        // 创建星形图像
        const star = this.add.image(x, y, 'star');
        
        // 添加缩放动画效果
        star.setScale(0);
        this.tweens.add({
          targets: star,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });
        
        // 添加旋转动画
        this.tweens.add({
          targets: star,
          angle: 360,
          duration: 2000,
          repeat: -1,
          ease: 'Linear'
        });
        
        starCount++;
        counterText.setText(`星形数量: ${starCount} / ${MAX_STARS}`);
        
        // 如果达到最大数量，移除定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          
          // 显示完成提示
          this.add.text(400, 560, '已生成全部星形！', {
            fontSize: '18px',
            color: '#00ff00'
          }).setOrigin(0.5);
        }
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
}

new Phaser.Game(config);
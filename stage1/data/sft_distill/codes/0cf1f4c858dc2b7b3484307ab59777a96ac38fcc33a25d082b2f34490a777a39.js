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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制五角星并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色五角星
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffd700, 1); // 金色边框
  
  // 五角星的顶点坐标（中心在原点）
  const points = [];
  const outerRadius = 25;
  const innerRadius = 10;
  
  for (let i = 0; i < 5; i++) {
    // 外顶点
    const outerAngle = (i * 72 - 90) * Math.PI / 180;
    points.push({
      x: 25 + Math.cos(outerAngle) * outerRadius,
      y: 25 + Math.sin(outerAngle) * outerRadius
    });
    
    // 内顶点
    const innerAngle = (i * 72 + 36 - 90) * Math.PI / 180;
    points.push({
      x: 25 + Math.cos(innerAngle) * innerRadius,
      y: 25 + Math.sin(innerAngle) * innerRadius
    });
  }
  
  // 绘制五角星路径
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 显示计数文本
  const countText = this.add.text(10, 10, `星星数量: ${starCount}/${MAX_STARS}`, {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每隔2秒生成一个星星
  const timerEvent = this.time.addEvent({
    delay: 2000, // 2秒 = 2000毫秒
    callback: () => {
      if (starCount < MAX_STARS) {
        // 在随机位置生成星星
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(50, 550);
        
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
        countText.setText(`星星数量: ${starCount}/${MAX_STARS}`);
        
        // 如果达到最大数量，停止定时器
        if (starCount >= MAX_STARS) {
          timerEvent.remove();
          
          // 显示完成提示
          const completeText = this.add.text(400, 300, '已生成所有星星！', {
            fontSize: '32px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
          });
          completeText.setOrigin(0.5);
          
          // 完成文本淡入效果
          completeText.setAlpha(0);
          this.tweens.add({
            targets: completeText,
            alpha: 1,
            duration: 500
          });
        }
      }
    },
    loop: true // 循环执行
  });
}

new Phaser.Game(config);
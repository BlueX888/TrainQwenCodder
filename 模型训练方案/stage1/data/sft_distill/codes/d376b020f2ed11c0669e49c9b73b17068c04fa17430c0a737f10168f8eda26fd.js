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
  // 使用 Graphics 绘制绿色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制星形
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  const starPoints = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  // 计算星形的顶点坐标
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push(
      outerRadius + radius * Math.cos(angle),
      outerRadius + radius * Math.sin(angle)
    );
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 星形计数器
  let starCount = 0;
  const maxStars = 3;
  
  // 创建定时器事件，每 0.5 秒生成一个星形
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建星形图像
      const star = this.add.image(x, y, 'star');
      
      // 增加计数
      starCount++;
      
      // 达到最大数量时移除定时器
      if (starCount >= maxStars) {
        timerEvent.remove();
        console.log('已生成 3 个星形，停止生成');
      }
    },
    loop: true
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每隔 0.5 秒生成一个绿色星形\n最多生成 3 个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
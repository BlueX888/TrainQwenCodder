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
  // 使用 Graphics 创建圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('grayCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 圆形计数器
  let circleCount = 0;
  const maxCircles = 5;
  
  // 创建定时器事件，每1.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒
    callback: () => {
      // 检查是否已达到最大数量
      if (circleCount < maxCircles) {
        // 生成随机位置（确保圆形完全在屏幕内）
        const randomX = Phaser.Math.Between(25, 775);
        const randomY = Phaser.Math.Between(25, 575);
        
        // 创建圆形精灵
        const circle = this.add.image(randomX, randomY, 'grayCircle');
        
        // 增加计数
        circleCount++;
        
        console.log(`生成第 ${circleCount} 个圆形，位置: (${randomX}, ${randomY})`);
        
        // 如果达到最大数量，移除定时器
        if (circleCount >= maxCircles) {
          timerEvent.remove();
          console.log('已生成5个圆形，停止生成');
        }
      }
    },
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每1.5秒生成一个灰色圆形\n最多生成5个', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
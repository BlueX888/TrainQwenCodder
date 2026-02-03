const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制菱形（四个顶点）
  const size = 40;
  graphics.beginPath();
  graphics.moveTo(0, -size); // 上顶点
  graphics.lineTo(size, 0);  // 右顶点
  graphics.lineTo(0, size);  // 下顶点
  graphics.lineTo(-size, 0); // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 菱形计数器
  let diamondCount = 0;
  const maxDiamonds = 3;
  
  // 创建定时器事件，每1.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建菱形图像
      this.add.image(x, y, 'diamond');
      
      // 增加计数
      diamondCount++;
      
      // 如果达到最大数量，停止定时器
      if (diamondCount >= maxDiamonds) {
        timerEvent.remove();
        console.log('已生成3个菱形，定时器已停止');
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每1.5秒生成一个绿色菱形（最多3个）', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
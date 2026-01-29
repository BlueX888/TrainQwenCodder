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
  // 初始化计数器
  this.diamondCount = 0;
  const maxDiamonds = 12;
  
  // 使用 Graphics 创建紫色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 绘制菱形（四个点连接成菱形）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 上顶点
  graphics.lineTo(size * 2, size);    // 右顶点
  graphics.lineTo(size, size * 2);    // 下顶点
  graphics.lineTo(0, size);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 显示提示信息
  const infoText = this.add.text(10, 10, 'Generating diamonds...', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每2.5秒生成一个菱形
  const timerEvent = this.time.addEvent({
    delay: 2500,                    // 2.5秒
    callback: () => {
      // 生成随机位置（确保菱形完全在屏幕内）
      const x = Phaser.Math.Between(30, 770);
      const y = Phaser.Math.Between(30, 570);
      
      // 创建菱形精灵
      const diamond = this.add.image(x, y, 'diamond');
      
      // 添加简单的缩放动画效果
      diamond.setScale(0);
      this.tweens.add({
        targets: diamond,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      // 增加计数
      this.diamondCount++;
      
      // 更新提示信息
      infoText.setText(`Diamonds: ${this.diamondCount} / ${maxDiamonds}`);
      
      // 如果达到最大数量，停止定时器
      if (this.diamondCount >= maxDiamonds) {
        timerEvent.remove();
        infoText.setText(`Complete! Generated ${maxDiamonds} diamonds.`);
        infoText.setColor('#00ff00');
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
}

new Phaser.Game(config);
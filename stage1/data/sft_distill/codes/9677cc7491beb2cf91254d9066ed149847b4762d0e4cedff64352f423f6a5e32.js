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
  // 无需加载外部资源
}

function create() {
  // 初始化矩形计数器
  this.rectangleCount = 0;
  const maxRectangles = 5;
  
  // 添加标题文字
  this.add.text(400, 30, 'Green Rectangles Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数显示
  this.countText = this.add.text(400, 70, 'Count: 0 / 5', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每2.5秒执行一次
  this.timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: spawnRectangle,
    callbackScope: this,
    loop: true
  });
  
  // 生成矩形的回调函数
  function spawnRectangle() {
    // 检查是否已达到最大数量
    if (this.rectangleCount >= maxRectangles) {
      // 停止定时器
      this.timerEvent.remove();
      
      // 显示完成提示
      this.add.text(400, 550, 'All rectangles spawned!', {
        fontSize: '20px',
        color: '#00ff00'
      }).setOrigin(0.5);
      
      return;
    }
    
    // 生成随机位置（确保矩形完全在画布内）
    const rectWidth = 60;
    const rectHeight = 40;
    const randomX = Phaser.Math.Between(50, 750 - rectWidth);
    const randomY = Phaser.Math.Between(120, 520 - rectHeight);
    
    // 创建 Graphics 对象绘制绿色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色，不透明
    graphics.fillRect(randomX, randomY, rectWidth, rectHeight);
    
    // 添加边框使矩形更明显
    graphics.lineStyle(2, 0x00aa00, 1);
    graphics.strokeRect(randomX, randomY, rectWidth, rectHeight);
    
    // 增加计数
    this.rectangleCount++;
    
    // 更新计数显示
    this.countText.setText(`Count: ${this.rectangleCount} / ${maxRectangles}`);
    
    // 在矩形中心添加序号
    this.add.text(randomX + rectWidth / 2, randomY + rectHeight / 2, 
      this.rectangleCount.toString(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}

new Phaser.Game(config);
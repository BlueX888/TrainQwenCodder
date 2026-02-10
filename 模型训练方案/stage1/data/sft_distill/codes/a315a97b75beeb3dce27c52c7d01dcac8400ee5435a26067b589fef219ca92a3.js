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
  // 计数器，用于跟踪已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 12;
  
  // 添加标题文本
  this.add.text(400, 30, '每1.5秒生成一个绿色矩形 (最多12个)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 显示计数器文本
  const counterText = this.add.text(400, 60, `已生成: ${rectangleCount}/${maxRectangles}`, {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每1.5秒执行一次
  this.time.addEvent({
    delay: 1500,                    // 1.5秒 = 1500毫秒
    callback: () => {
      // 生成随机位置
      // 留出边距，确保矩形不会超出边界（矩形大小为40x40）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(100, 550);
      
      // 创建绿色矩形
      const rectangle = this.add.rectangle(x, y, 40, 40, 0x00ff00);
      
      // 添加简单的缩放动画效果
      rectangle.setScale(0);
      this.tweens.add({
        targets: rectangle,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      // 更新计数器
      rectangleCount++;
      counterText.setText(`已生成: ${rectangleCount}/${maxRectangles}`);
      
      // 如果达到最大数量，显示完成提示
      if (rectangleCount === maxRectangles) {
        this.add.text(400, 570, '已完成！所有矩形已生成', {
          fontSize: '18px',
          color: '#ffff00'
        }).setOrigin(0.5);
      }
    },
    callbackScope: this,
    repeat: maxRectangles - 1       // 重复11次，加上首次执行共12次
  });
}

new Phaser.Game(config);
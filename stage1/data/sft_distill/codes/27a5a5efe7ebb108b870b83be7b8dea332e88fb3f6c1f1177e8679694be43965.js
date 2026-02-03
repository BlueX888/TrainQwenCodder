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
  // 计数器：记录已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 12;
  
  // 添加标题文本
  this.add.text(400, 30, 'Random Rectangle Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数文本
  const countText = this.add.text(400, 70, `Rectangles: 0 / ${maxRectangles}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每1.5秒触发一次
  this.time.addEvent({
    delay: 1500,              // 延迟1500毫秒（1.5秒）
    callback: () => {
      // 生成随机位置
      // 确保矩形完全在画布内（矩形大小为40x30）
      const x = Phaser.Math.Between(20, 780);
      const y = Phaser.Math.Between(120, 580);
      
      // 创建绿色矩形
      const rectangle = this.add.rectangle(x, y, 40, 30, 0x00ff00);
      
      // 添加轻微的透明度和边框效果
      rectangle.setStrokeStyle(2, 0x00cc00);
      
      // 添加简单的缩放动画
      this.tweens.add({
        targets: rectangle,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
      
      // 更新计数
      rectangleCount++;
      countText.setText(`Rectangles: ${rectangleCount} / ${maxRectangles}`);
    },
    callbackScope: this,
    repeat: 11                // 重复11次，加上第一次共12次
  });
  
  // 添加提示文本
  this.add.text(400, 560, 'Green rectangles will appear every 1.5 seconds', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
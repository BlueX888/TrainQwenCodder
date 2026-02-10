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
  // 无需预加载资源
}

function create() {
  // 矩形计数器
  let rectangleCount = 0;
  const maxRectangles = 10;
  
  // 添加标题文本
  this.add.text(400, 30, 'Green Rectangles Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数器文本
  const counterText = this.add.text(400, 70, `Rectangles: ${rectangleCount}/${maxRectangles}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500,                    // 2.5秒 = 2500毫秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(120, 550);
      
      // 生成随机尺寸（可选，增加视觉多样性）
      const width = Phaser.Math.Between(30, 60);
      const height = Phaser.Math.Between(30, 60);
      
      // 创建 Graphics 对象绘制绿色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
      graphics.fillRect(x, y, width, height);
      
      // 添加边框使矩形更明显
      graphics.lineStyle(2, 0x00aa00, 1);
      graphics.strokeRect(x, y, width, height);
      
      // 更新计数器
      rectangleCount++;
      counterText.setText(`Rectangles: ${rectangleCount}/${maxRectangles}`);
      
      // 添加生成动画效果（可选）
      graphics.setAlpha(0);
      this.tweens.add({
        targets: graphics,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
    },
    callbackScope: this,
    repeat: 9                       // 重复9次，加上首次执行共10次
  });
  
  // 添加提示文本
  this.add.text(400, 580, 'A new rectangle appears every 2.5 seconds', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
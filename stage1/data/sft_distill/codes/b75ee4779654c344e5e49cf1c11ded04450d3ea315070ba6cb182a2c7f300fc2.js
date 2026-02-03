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
  // 记录已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 5;
  
  // 添加标题文本
  this.add.text(400, 30, '每2.5秒生成一个绿色矩形（最多5个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 显示计数器
  const counterText = this.add.text(400, 60, `已生成: ${rectangleCount}/${maxRectangles}`, {
    fontSize: '16px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每2.5秒触发一次，重复4次（加上初始触发共5次）
  this.time.addEvent({
    delay: 2500,                    // 2.5秒 = 2500毫秒
    callback: generateRectangle,    // 回调函数
    callbackScope: this,            // 回调函数的作用域
    repeat: maxRectangles - 1,      // 重复4次（加上初始执行共5次）
    loop: false                     // 不循环
  });
  
  // 生成矩形的函数
  function generateRectangle() {
    // 生成随机位置（留出边距，避免矩形超出画布）
    const rectWidth = 60;
    const rectHeight = 40;
    const x = Phaser.Math.Between(rectWidth / 2, 800 - rectWidth / 2);
    const y = Phaser.Math.Between(100 + rectHeight / 2, 600 - rectHeight / 2);
    
    // 创建Graphics对象绘制绿色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
    graphics.fillRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);
    
    // 添加边框使矩形更明显
    graphics.lineStyle(2, 0x00aa00, 1);
    graphics.strokeRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);
    
    // 更新计数器
    rectangleCount++;
    counterText.setText(`已生成: ${rectangleCount}/${maxRectangles}`);
    
    // 添加生成动画效果（缩放从0到1）
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    console.log(`生成第 ${rectangleCount} 个矩形，位置: (${Math.round(x)}, ${Math.round(y)})`);
    
    // 如果达到最大数量，显示完成提示
    if (rectangleCount === maxRectangles) {
      this.time.delayedCall(500, () => {
        this.add.text(400, 570, '已完成！共生成5个矩形', {
          fontSize: '18px',
          color: '#00ff00',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
      });
    }
  }
}

// 启动游戏
new Phaser.Game(config);
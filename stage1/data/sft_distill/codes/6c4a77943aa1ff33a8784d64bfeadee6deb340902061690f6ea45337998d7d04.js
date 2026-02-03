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
  // 计数器：记录已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 12;
  
  // 添加标题文本
  this.add.text(10, 10, '每隔1秒生成紫色矩形（最多12个）', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 添加计数显示文本
  const countText = this.add.text(10, 40, `已生成: ${rectangleCount}/${maxRectangles}`, {
    fontSize: '18px',
    color: '#00ff00'
  });
  
  // 创建定时器事件，每隔1秒触发一次
  this.time.addEvent({
    delay: 1000,                    // 延迟1000毫秒（1秒）
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(100, 550);
      
      // 生成随机大小（可选，增加视觉多样性）
      const width = Phaser.Math.Between(30, 60);
      const height = Phaser.Math.Between(30, 60);
      
      // 创建紫色矩形 (0x9932cc 是深紫色)
      const rectangle = this.add.rectangle(x, y, width, height, 0x9932cc);
      
      // 添加轻微的透明度和描边效果
      rectangle.setStrokeStyle(2, 0xffffff, 0.5);
      
      // 更新计数
      rectangleCount++;
      countText.setText(`已生成: ${rectangleCount}/${maxRectangles}`);
      
      // 可选：添加简单的出现动画
      rectangle.setScale(0);
      this.tweens.add({
        targets: rectangle,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    },
    callbackScope: this,
    repeat: 11                      // 重复11次，加上第一次共12次
  });
}

new Phaser.Game(config);
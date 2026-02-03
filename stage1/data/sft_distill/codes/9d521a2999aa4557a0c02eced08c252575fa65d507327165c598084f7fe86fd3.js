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
  // 不需要预加载外部资源
}

function create() {
  // 矩形的尺寸
  const rectWidth = 50;
  const rectHeight = 50;
  
  // 计数器，用于跟踪已生成的矩形数量
  let spawnedCount = 0;
  const maxSpawns = 15;
  
  // 在屏幕上显示计数信息
  const countText = this.add.text(10, 10, `生成数量: 0 / ${maxSpawns}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每1.5秒触发一次
  this.time.addEvent({
    delay: 1500,              // 延迟1.5秒（1500毫秒）
    callback: spawnRectangle, // 回调函数
    callbackScope: this,      // 回调函数的作用域
    repeat: maxSpawns - 1,    // 重复14次（加上第一次共15次）
    loop: false               // 不循环
  });
  
  // 生成矩形的回调函数
  function spawnRectangle() {
    // 计算随机位置（确保矩形完全在屏幕内）
    const randomX = Phaser.Math.Between(
      rectWidth / 2, 
      this.scale.width - rectWidth / 2
    );
    const randomY = Phaser.Math.Between(
      rectHeight / 2, 
      this.scale.height - rectHeight / 2
    );
    
    // 创建蓝色矩形
    const rectangle = this.add.rectangle(
      randomX,
      randomY,
      rectWidth,
      rectHeight,
      0x0000ff  // 蓝色
    );
    
    // 添加简单的缩放动画效果
    rectangle.setScale(0);
    this.tweens.add({
      targets: rectangle,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // 更新计数
    spawnedCount++;
    countText.setText(`生成数量: ${spawnedCount} / ${maxSpawns}`);
    
    // 如果达到最大数量，显示完成信息
    if (spawnedCount === maxSpawns) {
      const completeText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2,
        '生成完成！',
        {
          fontSize: '32px',
          color: '#00ff00',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        }
      );
      completeText.setOrigin(0.5);
      
      // 完成文字淡入效果
      completeText.setAlpha(0);
      this.tweens.add({
        targets: completeText,
        alpha: 1,
        duration: 500
      });
    }
  }
}

new Phaser.Game(config);
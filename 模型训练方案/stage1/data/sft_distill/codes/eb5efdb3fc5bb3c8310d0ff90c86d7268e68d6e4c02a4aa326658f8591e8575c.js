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
  // 初始化计数器
  let circleCount = 0;
  const maxCircles = 20;
  
  // 添加标题文字
  this.add.text(10, 10, '每3秒生成一个青色圆形 (最多20个)', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 添加计数器文字
  const counterText = this.add.text(10, 40, `已生成: 0 / ${maxCircles}`, {
    fontSize: '16px',
    color: '#00ffff'
  });
  
  // 创建定时器，每3秒触发一次
  this.time.addEvent({
    delay: 3000,                    // 3秒间隔
    callback: spawnCircle,          // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: maxCircles - 1          // 重复19次（加上首次共20次）
  });
  
  // 生成圆形的回调函数
  function spawnCircle() {
    if (circleCount >= maxCircles) {
      return;
    }
    
    // 生成随机位置（留出边距避免圆形被裁切）
    const radius = 20;
    const x = Phaser.Math.Between(radius + 10, 800 - radius - 10);
    const y = Phaser.Math.Between(radius + 80, 600 - radius - 10);
    
    // 使用 Graphics 绘制青色圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1);  // 青色 (cyan)
    graphics.fillCircle(x, y, radius);
    
    // 添加淡入动画效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
    
    // 更新计数器
    circleCount++;
    counterText.setText(`已生成: ${circleCount} / ${maxCircles}`);
    
    // 如果达到最大数量，显示完成提示
    if (circleCount >= maxCircles) {
      this.add.text(400, 300, '生成完成！', {
        fontSize: '32px',
        color: '#00ff00'
      }).setOrigin(0.5);
    }
  }
}

new Phaser.Game(config);
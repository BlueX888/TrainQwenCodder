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
  // 不需要加载外部资源
}

function create() {
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 12;
  
  // 椭圆尺寸
  const ellipseWidth = 60;
  const ellipseHeight = 40;
  
  // 创建定时器事件，每 3 秒执行一次
  this.time.addEvent({
    delay: 3000,                    // 3 秒延迟
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: maxEllipses - 1         // 重复 11 次（加上首次共 12 次）
  });
  
  // 生成椭圆的函数
  function spawnEllipse() {
    // 生成随机位置（确保椭圆完全在画布内）
    const randomX = Phaser.Math.Between(
      ellipseWidth / 2, 
      config.width - ellipseWidth / 2
    );
    const randomY = Phaser.Math.Between(
      ellipseHeight / 2, 
      config.height - ellipseHeight / 2
    );
    
    // 创建 Graphics 对象绘制粉色椭圆
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色 (Hot Pink)
    graphics.fillEllipse(randomX, randomY, ellipseWidth, ellipseHeight);
    
    // 增加计数器
    ellipseCount++;
    
    // 在控制台输出进度（可选）
    console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${randomX}, ${randomY})`);
  }
  
  // 添加文本提示
  this.add.text(10, 10, '每 3 秒生成一个粉色椭圆\n最多生成 12 个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

// 创建游戏实例
new Phaser.Game(config);
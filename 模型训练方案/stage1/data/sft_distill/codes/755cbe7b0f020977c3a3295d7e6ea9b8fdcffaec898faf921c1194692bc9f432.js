const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 圆形半径
  const circleRadius = 20;
  // 已生成的圆形数量
  let circleCount = 0;
  // 最大生成数量
  const maxCircles = 15;
  
  // 创建定时器事件，每1秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 1000,              // 1秒 = 1000毫秒
    callback: spawnCircle,    // 回调函数
    callbackScope: this,      // 回调函数的作用域
    loop: true                // 循环执行
  });
  
  // 生成圆形的函数
  function spawnCircle() {
    // 检查是否已达到最大数量
    if (circleCount >= maxCircles) {
      // 停止定时器
      timerEvent.remove();
      console.log('已生成15个圆形，停止生成');
      return;
    }
    
    // 生成随机位置（考虑圆形半径，避免超出边界）
    const randomX = Phaser.Math.Between(circleRadius, config.width - circleRadius);
    const randomY = Phaser.Math.Between(circleRadius, config.height - circleRadius);
    
    // 创建 Graphics 对象绘制紫色圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色 (DarkOrchid)
    graphics.fillCircle(randomX, randomY, circleRadius);
    
    // 增加计数
    circleCount++;
    console.log(`生成第 ${circleCount} 个圆形，位置: (${randomX}, ${randomY})`);
  }
  
  // 添加提示文本
  this.add.text(10, 10, '每秒生成一个紫色圆形，最多15个', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

// 创建游戏实例
new Phaser.Game(config);
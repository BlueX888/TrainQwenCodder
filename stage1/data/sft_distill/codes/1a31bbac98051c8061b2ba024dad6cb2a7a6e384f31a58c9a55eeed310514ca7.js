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
  // 记录已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 12;
  
  // 创建定时器事件，每1秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 1000,                    // 1秒 = 1000毫秒
    callback: spawnRectangle,       // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true                      // 循环执行
  });
  
  // 生成矩形的函数
  function spawnRectangle() {
    // 检查是否已达到最大数量
    if (rectangleCount >= maxRectangles) {
      // 移除定时器，停止生成
      timerEvent.remove();
      console.log('已生成12个矩形，停止生成');
      return;
    }
    
    // 矩形尺寸
    const rectWidth = 50;
    const rectHeight = 50;
    
    // 随机位置（确保矩形完全在画布内）
    const x = Phaser.Math.Between(0, config.width - rectWidth);
    const y = Phaser.Math.Between(0, config.height - rectHeight);
    
    // 使用Graphics绘制紫色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1);  // 紫色
    graphics.fillRect(x, y, rectWidth, rectHeight);
    
    // 增加计数
    rectangleCount++;
    
    console.log(`生成第${rectangleCount}个矩形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);
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

let rectangleCount = 0;
const MAX_RECTANGLES = 12;
let timerEvent;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 重置计数器
  rectangleCount = 0;
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: spawnRectangle,
    callbackScope: this,
    loop: true             // 循环执行
  });
}

function spawnRectangle() {
  // 检查是否已达到最大数量
  if (rectangleCount >= MAX_RECTANGLES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
    return;
  }
  
  // 生成随机位置
  // 矩形大小为 50x50，确保不会超出边界
  const x = Phaser.Math.Between(25, 775);
  const y = Phaser.Math.Between(25, 575);
  
  // 创建紫色矩形 (紫色: 0x9370DB)
  const rectangle = this.add.rectangle(x, y, 50, 50, 0x9370DB);
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: rectangle,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 200,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
  
  // 增加计数
  rectangleCount++;
  
  // 在控制台输出进度
  console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
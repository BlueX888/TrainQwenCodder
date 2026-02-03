const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create },
  backgroundColor: '#2d2d2d'
};

let ellipseCount = 0;
const MAX_ELLIPSES = 12;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  ellipseCount = 0;
  
  // 创建定时器事件，每4秒触发一次
  timerEvent = this.time.addEvent({
    delay: 4000,                    // 4秒 = 4000毫秒
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true                      // 循环执行
  });
  
  // 立即生成第一个椭圆（可选，如果需要游戏开始就有一个）
  spawnEllipse.call(this);
}

function spawnEllipse() {
  // 检查是否已达到最大数量
  if (ellipseCount >= MAX_ELLIPSES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
    console.log('已生成12个椭圆，停止生成');
    return;
  }
  
  // 椭圆的尺寸
  const ellipseWidth = 60;
  const ellipseHeight = 40;
  
  // 生成随机位置（考虑边界，避免椭圆超出屏幕）
  const x = Phaser.Math.Between(
    ellipseWidth / 2, 
    this.scale.width - ellipseWidth / 2
  );
  const y = Phaser.Math.Between(
    ellipseHeight / 2, 
    this.scale.height - ellipseHeight / 2
  );
  
  // 创建Graphics对象绘制粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1);  // 粉色 (HotPink)
  graphics.fillEllipse(x, y, ellipseWidth, ellipseHeight);
  
  // 增加计数
  ellipseCount++;
  
  console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
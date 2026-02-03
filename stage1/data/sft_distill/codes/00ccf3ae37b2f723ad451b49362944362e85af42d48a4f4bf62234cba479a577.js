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

// 椭圆计数器
let ellipseCount = 0;
// 定时器引用
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  ellipseCount = 0;
  
  // 创建定时器事件，每0.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: createEllipse,
    callbackScope: this,
    loop: true
  });
}

/**
 * 创建白色椭圆的回调函数
 */
function createEllipse() {
  // 检查是否已生成10个椭圆
  if (ellipseCount >= 10) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成10个椭圆，停止生成');
    return;
  }
  
  // 生成随机位置
  // 椭圆半径范围：宽20-50，高15-40
  const radiusX = Phaser.Math.Between(20, 50);
  const radiusY = Phaser.Math.Between(15, 40);
  
  // 确保椭圆完全在画布内
  const x = Phaser.Math.Between(radiusX, config.width - radiusX);
  const y = Phaser.Math.Between(radiusY, config.height - radiusY);
  
  // 创建Graphics对象绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色，不透明
  graphics.fillEllipse(x, y, radiusX, radiusY);
  
  // 增加计数器
  ellipseCount++;
  
  console.log(`生成第${ellipseCount}个椭圆，位置: (${x}, ${y}), 半径: (${radiusX}, ${radiusY})`);
}

// 启动游戏
new Phaser.Game(config);
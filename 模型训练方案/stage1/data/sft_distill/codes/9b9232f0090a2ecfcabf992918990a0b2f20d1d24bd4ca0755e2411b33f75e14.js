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

let circleCount = 0;
const MAX_CIRCLES = 5;
const CIRCLE_RADIUS = 20;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 重置计数器
  circleCount = 0;
  
  // 创建定时器事件，每0.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500,                // 延迟500毫秒（0.5秒）
    callback: createCircle,    // 回调函数
    callbackScope: this,       // 回调函数的作用域
    loop: true                 // 循环执行
  });
  
  // 将定时器保存到场景中，以便在回调中访问
  this.circleTimer = timerEvent;
}

function createCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    // 停止定时器
    this.circleTimer.remove();
    console.log('已生成5个圆形，停止生成');
    return;
  }
  
  // 生成随机位置
  // 确保圆形完全在画布内（考虑半径）
  const x = Phaser.Math.Between(CIRCLE_RADIUS, this.scale.width - CIRCLE_RADIUS);
  const y = Phaser.Math.Between(CIRCLE_RADIUS, this.scale.height - CIRCLE_RADIUS);
  
  // 使用Graphics绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(x, y, CIRCLE_RADIUS);
  
  // 增加计数
  circleCount++;
  console.log(`生成第${circleCount}个圆形，位置: (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
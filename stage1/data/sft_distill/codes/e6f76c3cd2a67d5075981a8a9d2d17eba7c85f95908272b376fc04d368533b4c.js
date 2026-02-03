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
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  circleCount = 0;
  
  // 创建定时器事件，每0.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 500,                // 0.5秒 = 500毫秒
    callback: spawnCircle,     // 回调函数
    callbackScope: this,       // 回调函数的作用域
    loop: true                 // 循环执行
  });
}

function spawnCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    timerEvent.remove();  // 停止定时器
    return;
  }
  
  // 生成随机位置
  // 留出边距，确保圆形完全在画布内（半径为20）
  const x = Phaser.Math.Between(30, 770);
  const y = Phaser.Math.Between(30, 570);
  
  // 创建 Graphics 对象绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);  // 灰色
  graphics.fillCircle(x, y, 20);    // 半径为20的圆形
  
  // 增加计数
  circleCount++;
  
  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipseCount = 0;
const MAX_ELLIPSES = 15;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建定时器事件，每隔1.5秒执行一次
  timerEvent = this.time.addEvent({
    delay: 1500, // 1.5秒 = 1500毫秒
    callback: spawnEllipse,
    callbackScope: this,
    loop: true
  });
}

function spawnEllipse() {
  // 检查是否已达到最大数量
  if (ellipseCount >= MAX_ELLIPSES) {
    timerEvent.remove(); // 停止定时器
    console.log('已生成15个椭圆，停止生成');
    return;
  }

  // 生成随机位置
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 椭圆的随机尺寸（可选，这里使用固定尺寸）
  const radiusX = 40;
  const radiusY = 25;

  // 创建Graphics对象并绘制白色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色，不透明
  graphics.fillEllipse(x, y, radiusX, radiusY);

  // 增加计数器
  ellipseCount++;
  
  console.log(`生成第${ellipseCount}个椭圆，位置: (${x}, ${y})`);
}

function update(time, delta) {
  // 本例中无需每帧更新逻辑
}

new Phaser.Game(config);
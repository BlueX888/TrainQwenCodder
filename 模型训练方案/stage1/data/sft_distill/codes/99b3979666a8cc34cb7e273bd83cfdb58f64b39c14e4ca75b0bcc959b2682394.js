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

let ellipseCount = 0;
const MAX_ELLIPSES = 15;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 添加标题文本
  this.add.text(10, 10, 'Green Ellipses Generator', {
    fontSize: '24px',
    color: '#ffffff'
  });

  // 添加计数器文本
  const counterText = this.add.text(10, 50, `Count: ${ellipseCount}/${MAX_ELLIPSES}`, {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 创建定时器事件，每2秒触发一次，重复14次（加上第一次共15次）
  this.time.addEvent({
    delay: 2000,                    // 2秒间隔
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调函数的作用域
    repeat: MAX_ELLIPSES - 1,       // 重复14次（总共执行15次）
    args: [counterText]             // 传递计数器文本对象
  });
}

function spawnEllipse(counterText) {
  // 生成随机位置
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(100, 550);
  
  // 生成随机椭圆尺寸
  const width = Phaser.Math.Between(40, 80);
  const height = Phaser.Math.Between(30, 60);

  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);  // 绿色，完全不透明
  graphics.fillEllipse(x, y, width, height);

  // 更新计数器
  ellipseCount++;
  counterText.setText(`Count: ${ellipseCount}/${MAX_ELLIPSES}`);

  // 添加生成动画效果（可选）
  graphics.setAlpha(0);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });

  // 在控制台输出信息
  console.log(`Ellipse ${ellipseCount} spawned at (${x}, ${y})`);
}

new Phaser.Game(config);
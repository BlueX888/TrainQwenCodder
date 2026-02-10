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
  // 添加标题文字
  this.add.text(10, 10, 'Green Ellipses Generator', {
    fontSize: '24px',
    color: '#ffffff'
  });

  // 添加计数器文字
  const counterText = this.add.text(10, 50, `Count: ${ellipseCount}/${MAX_ELLIPSES}`, {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 创建定时器事件，每 2 秒执行一次
  this.time.addEvent({
    delay: 2000,                    // 延迟 2000 毫秒（2秒）
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调函数的作用域
    args: [counterText],            // 传递给回调函数的参数
    repeat: MAX_ELLIPSES - 1,       // 重复 14 次（加上首次共 15 次）
    loop: false                     // 不循环
  });
}

/**
 * 生成绿色椭圆的函数
 * @param {Phaser.GameObjects.Text} counterText - 计数器文本对象
 */
function spawnEllipse(counterText) {
  // 生成随机位置
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(100, 550);
  
  // 生成随机椭圆尺寸（宽度和高度）
  const radiusX = Phaser.Math.Between(20, 50);
  const radiusY = Phaser.Math.Between(20, 50);

  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
  graphics.fillEllipse(x, y, radiusX * 2, radiusY * 2);

  // 可选：添加边框
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokeEllipse(x, y, radiusX * 2, radiusY * 2);

  // 增加计数器
  ellipseCount++;
  
  // 更新计数器文字
  counterText.setText(`Count: ${ellipseCount}/${MAX_ELLIPSES}`);

  // 添加淡入效果
  graphics.setAlpha(0);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });

  // 输出日志
  console.log(`Ellipse #${ellipseCount} spawned at (${x}, ${y})`);
}

// 创建游戏实例
new Phaser.Game(config);
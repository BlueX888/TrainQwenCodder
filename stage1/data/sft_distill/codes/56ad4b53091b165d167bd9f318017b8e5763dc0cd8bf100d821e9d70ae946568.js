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
const MAX_RECTANGLES = 10;

function preload() {
  // 无需预加载资源
}

function create() {
  // 添加标题文本
  this.add.text(400, 30, 'Green Rectangles Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加计数文本
  const countText = this.add.text(400, 70, `Count: ${rectangleCount}/${MAX_RECTANGLES}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建定时器事件，每2.5秒触发一次，重复9次（加上首次共10次）
  this.time.addEvent({
    delay: 2500,                    // 2.5秒
    callback: spawnRectangle,       // 回调函数
    callbackScope: this,            // 回调作用域
    args: [countText],              // 传递计数文本作为参数
    repeat: MAX_RECTANGLES - 1,     // 重复9次，加上首次执行共10次
    loop: false                     // 不循环
  });
}

function spawnRectangle(countText) {
  // 生成随机位置（确保矩形完全在画布内）
  const rectWidth = 60;
  const rectHeight = 40;
  const x = Phaser.Math.Between(rectWidth / 2, 800 - rectWidth / 2);
  const y = Phaser.Math.Between(120, 600 - rectHeight / 2);

  // 创建 Graphics 对象绘制绿色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
  graphics.fillRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);

  // 添加边框使矩形更明显
  graphics.lineStyle(2, 0x00aa00, 1);
  graphics.strokeRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);

  // 更新计数
  rectangleCount++;
  countText.setText(`Count: ${rectangleCount}/${MAX_RECTANGLES}`);

  // 添加生成动画效果（可选）
  graphics.setAlpha(0);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });

  // 在控制台输出信息
  console.log(`Rectangle ${rectangleCount} spawned at (${Math.round(x)}, ${Math.round(y)})`);

  // 如果达到最大数量，显示完成消息
  if (rectangleCount >= MAX_RECTANGLES) {
    this.add.text(400, 550, 'All rectangles generated!', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }
}

// 启动游戏
new Phaser.Game(config);
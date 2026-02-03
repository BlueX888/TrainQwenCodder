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

// 矩形计数器
let rectangleCount = 0;
const MAX_RECTANGLES = 8;

// 矩形尺寸
const RECT_WIDTH = 60;
const RECT_HEIGHT = 40;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  rectangleCount = 0;

  // 添加标题文本
  this.add.text(400, 30, '每秒生成灰色矩形 (最多8个)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 显示计数文本
  const countText = this.add.text(400, 70, `已生成: ${rectangleCount}/${MAX_RECTANGLES}`, {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建定时器，每1秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 1000,                    // 1秒 = 1000毫秒
    callback: spawnRectangle,       // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true,                     // 循环执行
    args: [this, countText, timerEvent] // 传递参数
  });

  // 立即生成第一个矩形（可选）
  spawnRectangle(this, countText, timerEvent);
}

/**
 * 生成矩形的函数
 * @param {Phaser.Scene} scene - 当前场景
 * @param {Phaser.GameObjects.Text} countText - 计数文本对象
 * @param {Phaser.Time.TimerEvent} timerEvent - 定时器事件对象
 */
function spawnRectangle(scene, countText, timerEvent) {
  // 检查是否已达到最大数量
  if (rectangleCount >= MAX_RECTANGLES) {
    // 停止定时器
    timerEvent.remove();
    
    // 更新文本显示完成状态
    countText.setText(`已生成: ${rectangleCount}/${MAX_RECTANGLES} - 完成！`);
    countText.setColor('#ffff00');
    
    return;
  }

  // 生成随机位置（确保矩形完全在画布内）
  const x = Phaser.Math.Between(RECT_WIDTH / 2, 800 - RECT_WIDTH / 2);
  const y = Phaser.Math.Between(120, 600 - RECT_HEIGHT / 2);

  // 创建 Graphics 对象绘制灰色矩形
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色 (RGB: 128, 128, 128)
  
  // 绘制矩形（以中心点为基准）
  graphics.fillRect(
    x - RECT_WIDTH / 2,
    y - RECT_HEIGHT / 2,
    RECT_WIDTH,
    RECT_HEIGHT
  );

  // 添加白色边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeRect(
    x - RECT_WIDTH / 2,
    y - RECT_HEIGHT / 2,
    RECT_WIDTH,
    RECT_HEIGHT
  );

  // 在矩形中心添加编号文本
  scene.add.text(x, y, `${rectangleCount + 1}`, {
    fontSize: '18px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 增加计数
  rectangleCount++;

  // 更新计数文本
  countText.setText(`已生成: ${rectangleCount}/${MAX_RECTANGLES}`);

  // 添加生成动画效果（可选）
  graphics.setAlpha(0);
  scene.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });
}

// 创建游戏实例
new Phaser.Game(config);
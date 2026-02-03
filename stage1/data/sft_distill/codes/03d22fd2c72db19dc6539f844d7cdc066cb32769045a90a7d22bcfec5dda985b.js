const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let ellipseCount = 0;
const MAX_ELLIPSES = 15;

function preload() {
  // 不需要预加载资源
}

function create() {
  // 重置计数器
  ellipseCount = 0;

  // 创建定时器事件，每隔 2 秒执行一次
  this.time.addEvent({
    delay: 2000,                    // 2 秒间隔
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: MAX_ELLIPSES - 1        // 重复 14 次（加上第一次共 15 次）
  });

  // 添加文本显示当前生成数量
  this.countText = this.add.text(10, 10, `椭圆数量: ${ellipseCount}/${MAX_ELLIPSES}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnEllipse() {
  // 生成随机位置（留出边距避免椭圆超出边界）
  const margin = 50;
  const x = Phaser.Math.Between(margin, this.scale.width - margin);
  const y = Phaser.Math.Between(margin, this.scale.height - margin);

  // 生成随机椭圆尺寸
  const radiusX = Phaser.Math.Between(20, 40);
  const radiusY = Phaser.Math.Between(15, 35);

  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
  graphics.fillEllipse(x, y, radiusX, radiusY);

  // 增加计数器
  ellipseCount++;

  // 更新文本显示
  this.countText.setText(`椭圆数量: ${ellipseCount}/${MAX_ELLIPSES}`);

  // 添加一个淡入效果
  graphics.setAlpha(0);
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });

  console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
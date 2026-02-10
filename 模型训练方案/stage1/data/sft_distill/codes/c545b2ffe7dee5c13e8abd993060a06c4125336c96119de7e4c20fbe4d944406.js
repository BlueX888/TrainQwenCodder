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

// 记录已生成的圆形数量
let circleCount = 0;
const MAX_CIRCLES = 10;

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500,                    // 2.5秒 = 2500毫秒
    callback: createCircle,         // 回调函数
    callbackScope: this,            // 回调作用域
    repeat: MAX_CIRCLES - 1,        // 重复9次（第一次+重复9次=10次）
    loop: false                     // 不循环，达到repeat次数后停止
  });

  // 显示提示文字
  this.add.text(10, 10, '每2.5秒生成一个绿色圆形（最多10个）', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示计数文字
  this.countText = this.add.text(10, 40, '已生成: 0/10', {
    fontSize: '16px',
    color: '#00ff00'
  });
}

function createCircle() {
  // 检查是否已达到最大数量
  if (circleCount >= MAX_CIRCLES) {
    return;
  }

  // 生成随机位置
  // 留出边距，确保圆形完全显示在画布内
  const radius = 20;
  const x = Phaser.Math.Between(radius + 10, 800 - radius - 10);
  const y = Phaser.Math.Between(radius + 80, 600 - radius - 10);

  // 使用Graphics绘制绿色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);  // 绿色，不透明
  graphics.fillCircle(x, y, radius);

  // 添加白色边框使圆形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeCircle(x, y, radius);

  // 更新计数
  circleCount++;
  this.countText.setText(`已生成: ${circleCount}/${MAX_CIRCLES}`);

  // 添加简单的缩放动画效果
  graphics.setScale(0);
  this.tweens.add({
    targets: graphics,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);

  // 如果达到最大数量，显示完成提示
  if (circleCount === MAX_CIRCLES) {
    this.time.delayedCall(500, () => {
      this.add.text(400, 300, '生成完成！', {
        fontSize: '32px',
        color: '#00ff00'
      }).setOrigin(0.5);
    });
  }
}

// 启动游戏
new Phaser.Game(config);
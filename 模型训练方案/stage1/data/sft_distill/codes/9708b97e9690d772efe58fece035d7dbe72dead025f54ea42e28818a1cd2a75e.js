const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需加载外部资源
}

function create() {
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 5;

  // 添加标题文本
  this.add.text(400, 30, '每隔3秒生成灰色椭圆（最多5个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加计数显示文本
  const countText = this.add.text(400, 60, `已生成: 0 / ${maxEllipses}`, {
    fontSize: '16px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建定时器事件，每3秒触发一次
  this.time.addEvent({
    delay: 3000,                    // 3秒间隔
    callback: generateEllipse,      // 回调函数
    callbackScope: this,            // 回调作用域
    loop: false,                    // 不循环
    repeat: maxEllipses - 1         // 重复4次，加上首次共5次
  });

  // 生成椭圆的函数
  function generateEllipse() {
    if (ellipseCount < maxEllipses) {
      // 生成随机位置（确保椭圆完全在画布内）
      const ellipseWidth = 80;
      const ellipseHeight = 50;
      const randomX = Phaser.Math.Between(ellipseWidth / 2 + 20, 800 - ellipseWidth / 2 - 20);
      const randomY = Phaser.Math.Between(ellipseHeight / 2 + 100, 600 - ellipseHeight / 2 - 20);

      // 创建 Graphics 对象绘制椭圆
      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1); // 灰色
      graphics.fillEllipse(randomX, randomY, ellipseWidth, ellipseHeight);

      // 添加椭圆编号文本
      this.add.text(randomX, randomY, `${ellipseCount + 1}`, {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);

      // 递增计数器
      ellipseCount++;

      // 更新计数显示
      countText.setText(`已生成: ${ellipseCount} / ${maxEllipses}`);

      // 在控制台输出日志
      console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${randomX}, ${randomY})`);
    }
  }
}

new Phaser.Game(config);
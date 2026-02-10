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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 12;

  // 创建定时事件，每隔 4 秒执行一次
  this.time.addEvent({
    delay: 4000,                    // 4 秒间隔
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调作用域
    loop: false,                    // 不循环
    repeat: maxEllipses - 1         // 重复 11 次（加上首次共 12 次）
  });

  // 生成椭圆的函数
  function spawnEllipse() {
    ellipseCount++;

    // 生成随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    // 椭圆的宽高（随机大小增加趣味性）
    const radiusX = Phaser.Math.Between(30, 60);
    const radiusY = Phaser.Math.Between(20, 40);

    // 使用 Graphics 绘制粉色椭圆
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFC0CB, 1); // 粉色 (pink)
    graphics.fillEllipse(x, y, radiusX, radiusY);

    // 添加文字显示当前生成的椭圆编号
    this.add.text(x, y, ellipseCount.toString(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${x}, ${y})`);

    // 如果达到最大数量，输出提示
    if (ellipseCount >= maxEllipses) {
      console.log('已生成全部 12 个椭圆');
    }
  }

  // 添加说明文字
  this.add.text(400, 30, '每隔 4 秒生成一个粉色椭圆（最多 12 个）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 570, '查看控制台可看到生成日志', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  // 无需预加载资源
}

function create() {
  // 圆形半径
  const radius = 20;
  // 已生成的圆形数量
  let circleCount = 0;
  // 最大生成数量
  const maxCircles = 20;

  // 生成圆形的函数
  const spawnCircle = () => {
    if (circleCount >= maxCircles) {
      return;
    }

    // 生成随机位置（确保圆形完全在画布内）
    const x = Phaser.Math.Between(radius, config.width - radius);
    const y = Phaser.Math.Between(radius, config.height - radius);

    // 创建 Graphics 对象绘制青色圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色 (Cyan)
    graphics.fillCircle(x, y, radius);

    // 增加计数
    circleCount++;

    console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
  };

  // 立即生成第一个圆形
  spawnCircle();

  // 创建定时器，每隔 3 秒生成一个圆形
  // repeat 设置为 19，加上初始的 1 个，总共 20 个
  this.time.addEvent({
    delay: 3000,           // 3 秒间隔
    callback: spawnCircle, // 回调函数
    callbackScope: this,   // 回调作用域
    repeat: 19,            // 重复 19 次（总共 20 个圆形）
    loop: false            // 不循环
  });

  // 添加提示文本
  const text = this.add.text(10, 10, '每 3 秒生成一个青色圆形\n最多生成 20 个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
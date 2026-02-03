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
  // 无需预加载资源
}

function create() {
  // 计数器：记录已生成的椭圆数量
  let ellipseCount = 0;
  const maxEllipses = 12;

  // 创建定时器事件，每 3 秒触发一次
  this.time.addEvent({
    delay: 3000,                    // 3 秒间隔
    callback: spawnEllipse,         // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true,                     // 循环执行
    repeat: maxEllipses - 1         // 重复 11 次（加上首次执行共 12 次）
  });

  // 生成椭圆的函数
  function spawnEllipse() {
    // 随机生成椭圆的位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 随机生成椭圆的尺寸
    const radiusX = Phaser.Math.Between(20, 40);
    const radiusY = Phaser.Math.Between(15, 35);

    // 创建 Graphics 对象并绘制粉色椭圆
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1);  // 粉色 (HotPink)
    graphics.fillEllipse(x, y, radiusX, radiusY);

    // 增加计数器
    ellipseCount++;
    
    // 在控制台输出信息（可选）
    console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);
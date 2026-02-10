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
  const maxEllipses = 10;

  // 创建定时器事件，每0.5秒执行一次
  this.time.addEvent({
    delay: 500,                    // 0.5秒 = 500毫秒
    callback: createEllipse,       // 回调函数
    callbackScope: this,           // 回调函数的作用域
    repeat: maxEllipses - 1,       // 重复9次（加上第一次共10次）
    loop: false                    // 不循环
  });

  // 创建椭圆的函数
  function createEllipse() {
    // 生成随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    // 椭圆的宽度和高度（随机大小增加视觉效果）
    const width = Phaser.Math.Between(40, 80);
    const height = Phaser.Math.Between(30, 60);

    // 使用Graphics绘制白色椭圆
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);  // 白色，不透明
    graphics.fillEllipse(x, y, width, height);

    // 增加计数器
    ellipseCount++;
    
    // 在控制台输出当前生成的椭圆数量
    console.log(`已生成椭圆数量: ${ellipseCount}/${maxEllipses}`);
  }
}

// 创建游戏实例
new Phaser.Game(config);
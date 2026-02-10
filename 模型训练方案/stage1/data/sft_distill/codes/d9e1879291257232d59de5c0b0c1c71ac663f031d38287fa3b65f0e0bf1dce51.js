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

let rectangleCount = 0;
const MAX_RECTANGLES = 12;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 初始化计数器
  rectangleCount = 0;

  // 创建定时器事件，每隔1秒执行一次，重复11次（加上首次共12次）
  this.time.addEvent({
    delay: 1000,                    // 1秒间隔
    callback: spawnRectangle,       // 回调函数
    callbackScope: this,            // 回调作用域
    loop: false,                    // 不循环
    repeat: MAX_RECTANGLES - 1      // 重复11次，加上首次执行共12次
  });

  // 添加文本显示当前生成的矩形数量
  this.countText = this.add.text(10, 10, 'Rectangles: 0/12', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

function spawnRectangle() {
  // 生成随机位置
  const rectWidth = 50;
  const rectHeight = 50;
  const x = Phaser.Math.Between(rectWidth / 2, 800 - rectWidth / 2);
  const y = Phaser.Math.Between(rectHeight / 2, 600 - rectHeight / 2);

  // 创建紫色矩形
  const rectangle = this.add.rectangle(x, y, rectWidth, rectHeight, 0x9933ff);
  
  // 添加边框效果
  rectangle.setStrokeStyle(2, 0xffffff);

  // 增加计数
  rectangleCount++;

  // 更新文本显示
  this.countText.setText(`Rectangles: ${rectangleCount}/${MAX_RECTANGLES}`);

  // 添加生成动画效果
  rectangle.setScale(0);
  this.tweens.add({
    targets: rectangle,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });

  console.log(`生成第 ${rectangleCount} 个矩形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
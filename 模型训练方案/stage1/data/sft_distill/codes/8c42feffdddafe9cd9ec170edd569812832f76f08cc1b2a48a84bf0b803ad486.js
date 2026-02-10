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

let squareCount = 0;
const MAX_SQUARES = 15;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('redSquare', 40, 40);
  graphics.destroy();

  // 创建定时器事件，每2.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2500,                    // 2.5秒 = 2500毫秒
    callback: spawnSquare,          // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true                      // 循环执行
  });

  // 添加文字提示
  this.add.text(10, 10, 'Red squares will spawn every 2.5s (max 15)', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示计数器
  this.counterText = this.add.text(10, 40, `Squares: ${squareCount}/${MAX_SQUARES}`, {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function spawnSquare() {
  // 检查是否已达到最大数量
  if (squareCount >= MAX_SQUARES) {
    // 停止并销毁定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 添加完成提示
    this.add.text(400, 300, 'All 15 squares spawned!', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }

  // 生成随机位置（确保方块不会超出边界）
  const x = Phaser.Math.Between(20, 780);
  const y = Phaser.Math.Between(80, 580);

  // 创建红色方块
  const square = this.add.image(x, y, 'redSquare');
  
  // 添加简单的缩放动画效果
  square.setScale(0);
  this.tweens.add({
    targets: square,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 增加计数器
  squareCount++;
  
  // 更新计数器文本
  this.counterText.setText(`Squares: ${squareCount}/${MAX_SQUARES}`);
}

// 创建游戏实例
new Phaser.Game(config);
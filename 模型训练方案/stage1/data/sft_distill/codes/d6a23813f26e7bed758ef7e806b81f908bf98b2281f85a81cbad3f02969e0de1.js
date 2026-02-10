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
const MAX_SQUARES = 10;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('purpleSquare', 50, 50);
  graphics.destroy();

  // 初始化计数器
  squareCount = 0;

  // 创建定时器事件，每2秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: spawnSquare,
    callbackScope: this,
    loop: true
  });

  // 添加提示文本
  this.add.text(10, 10, 'Purple squares will spawn every 2 seconds', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 添加计数器文本
  this.counterText = this.add.text(10, 40, `Squares: ${squareCount}/${MAX_SQUARES}`, {
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
}

function spawnSquare() {
  // 检查是否已达到最大数量
  if (squareCount >= MAX_SQUARES) {
    timerEvent.remove(); // 移除定时器
    this.add.text(400, 300, 'Max squares reached!', {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    return;
  }

  // 生成随机位置（确保方块完全在屏幕内）
  const randomX = Phaser.Math.Between(25, 775);
  const randomY = Phaser.Math.Between(75, 575);

  // 创建紫色方块
  const square = this.add.image(randomX, randomY, 'purpleSquare');
  
  // 添加缩放动画效果
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

new Phaser.Game(config);
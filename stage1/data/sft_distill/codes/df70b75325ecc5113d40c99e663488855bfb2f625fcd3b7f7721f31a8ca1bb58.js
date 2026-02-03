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

let squareCount = 0;
const MAX_SQUARES = 12;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('greySquare', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每4秒触发一次
  timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnSquare,
    callbackScope: this,
    loop: true
  });

  // 添加文本显示当前方块数量
  this.counterText = this.add.text(10, 10, `Squares: ${squareCount}/${MAX_SQUARES}`, {
    fontSize: '24px',
    color: '#ffffff'
  });
}

function spawnSquare() {
  // 检查是否已达到最大数量
  if (squareCount >= MAX_SQUARES) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成最大数量的方块');
    return;
  }

  // 生成随机位置（确保方块完全在画布内）
  const x = Phaser.Math.Between(25, 775);
  const y = Phaser.Math.Between(25, 575);

  // 创建方块
  const square = this.add.image(x, y, 'greySquare');
  
  // 添加简单的缩放动画效果
  square.setScale(0);
  this.tweens.add({
    targets: square,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 增加计数
  squareCount++;
  
  // 更新文本显示
  this.counterText.setText(`Squares: ${squareCount}/${MAX_SQUARES}`);
  
  console.log(`生成第 ${squareCount} 个方块，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
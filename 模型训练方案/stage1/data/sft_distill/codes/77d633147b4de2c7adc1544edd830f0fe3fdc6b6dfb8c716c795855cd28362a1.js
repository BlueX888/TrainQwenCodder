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
const MAX_SQUARES = 12;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('greySquare', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每4秒执行一次
  timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnSquare,
    callbackScope: this,
    loop: true
  });

  // 添加文本显示当前方块数量
  this.countText = this.add.text(10, 10, `方块数量: ${squareCount}/${MAX_SQUARES}`, {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnSquare() {
  // 检查是否已达到最大数量
  if (squareCount >= MAX_SQUARES) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成最大数量的方块');
    return;
  }

  // 生成随机位置
  // 确保方块完全在画布内（留出50px的边距，因为方块大小是50x50）
  const randomX = Phaser.Math.Between(25, 775);
  const randomY = Phaser.Math.Between(25, 575);

  // 创建方块
  const square = this.add.image(randomX, randomY, 'greySquare');
  
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
  this.countText.setText(`方块数量: ${squareCount}/${MAX_SQUARES}`);

  console.log(`生成第 ${squareCount} 个方块，位置: (${randomX}, ${randomY})`);
}

// 创建游戏实例
new Phaser.Game(config);
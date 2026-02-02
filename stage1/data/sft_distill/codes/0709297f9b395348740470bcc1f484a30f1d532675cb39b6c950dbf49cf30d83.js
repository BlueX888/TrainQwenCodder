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
const MAX_SQUARES = 5;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('orangeSquare', 50, 50);
  graphics.destroy();

  // 创建定时器事件，每2秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2000, // 2秒
    callback: spawnSquare,
    callbackScope: this,
    loop: true
  });

  // 添加提示文本
  this.add.text(10, 10, '每2秒生成一个橙色方块\n最多生成5个', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function spawnSquare() {
  // 检查是否已达到最大数量
  if (squareCount >= MAX_SQUARES) {
    timerEvent.remove(); // 停止定时器
    this.add.text(400, 300, '已生成5个方块！', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    return;
  }

  // 生成随机位置（确保方块完全在屏幕内）
  const x = Phaser.Math.Between(25, 775);
  const y = Phaser.Math.Between(25, 575);

  // 创建橙色方块
  const square = this.add.image(x, y, 'orangeSquare');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: square,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 200,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });

  squareCount++;

  // 更新计数显示
  const countText = this.add.text(x, y, squareCount.toString(), {
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  console.log(`生成第 ${squareCount} 个方块，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
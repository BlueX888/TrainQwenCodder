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
let timerEvent = null;

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

  // 添加文本提示
  this.add.text(10, 10, '橙色方块生成中...', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function spawnSquare() {
  // 检查是否已生成5个方块
  if (squareCount >= 5) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 更新提示文本
    this.add.text(10, 40, '已生成5个方块！', {
      fontSize: '20px',
      color: '#00ff00'
    });
    return;
  }

  // 生成随机位置（确保方块完全在画布内）
  const x = Phaser.Math.Between(25, 775); // 留出方块一半的边距
  const y = Phaser.Math.Between(25, 575);

  // 创建橙色方块
  const square = this.add.image(x, y, 'orangeSquare');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: square,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 100,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });

  // 增加计数
  squareCount++;
  
  console.log(`生成第 ${squareCount} 个橙色方块，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
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

// 存储生成的方块
let squares = [];
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy();

  // 添加提示文本
  this.add.text(10, 10, '每0.5秒生成一个红色方块，最多3个', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 创建定时器事件，每0.5秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500,           // 0.5秒 = 500毫秒
    callback: spawnSquare,
    callbackScope: this,
    loop: true            // 循环执行
  });
}

function spawnSquare() {
  // 检查是否已经生成了3个方块
  if (squares.length >= 3) {
    // 达到最大数量，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    console.log('已生成3个方块，停止生成');
    return;
  }

  // 生成随机位置（留出边距，避免方块超出边界）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(100, 550);

  // 创建红色方块
  const square = this.add.image(x, y, 'redSquare');
  
  // 添加到数组中追踪
  squares.push(square);

  console.log(`生成第 ${squares.length} 个方块，位置: (${x}, ${y})`);
}

new Phaser.Game(config);
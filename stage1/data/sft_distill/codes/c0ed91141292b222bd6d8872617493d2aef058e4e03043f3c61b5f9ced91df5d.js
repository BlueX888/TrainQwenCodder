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

// 方块计数器
let squareCount = 0;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置计数器
  squareCount = 0;
  
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy();
  
  // 创建定时器事件，每 0.5 秒执行一次
  timerEvent = this.time.addEvent({
    delay: 500,                // 0.5 秒 = 500 毫秒
    callback: spawnSquare,     // 回调函数
    callbackScope: this,       // 回调作用域
    loop: true                 // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每 0.5 秒生成一个红色方块（最多 3 个）', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function spawnSquare() {
  // 检查是否已生成 3 个方块
  if (squareCount >= 3) {
    // 移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, '已生成 3 个方块！', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（避免方块超出边界）
  const x = Phaser.Math.Between(25, 775);
  const y = Phaser.Math.Between(50, 575);
  
  // 在随机位置创建红色方块
  const square = this.add.image(x, y, 'redSquare');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: square,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power1'
  });
  
  // 增加计数
  squareCount++;
  
  console.log(`生成第 ${squareCount} 个方块，位置: (${x}, ${y})`);
}

// 启动游戏
new Phaser.Game(config);
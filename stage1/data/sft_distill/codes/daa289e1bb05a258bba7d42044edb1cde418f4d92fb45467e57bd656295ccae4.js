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
let timerEvent = null;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
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
  this.add.text(10, 10, '每2秒生成一个橙色方块，最多5个', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示当前方块数量的文本
  this.countText = this.add.text(10, 40, '方块数量: 0 / 5', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function spawnSquare() {
  // 检查是否已经生成了5个方块
  if (squareCount >= 5) {
    // 达到最大数量，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置（确保方块完全在画布内）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(100, 550);

  // 创建橙色方块
  const square = this.add.image(x, y, 'orangeSquare');
  
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

  // 更新计数文本
  this.countText.setText(`方块数量: ${squareCount} / 5`);

  // 如果达到5个，显示完成提示
  if (squareCount >= 5) {
    this.add.text(400, 300, '已生成5个方块！', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);
  }
}

new Phaser.Game(config);
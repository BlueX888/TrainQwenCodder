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

// 用于跟踪生成的方块数量
let squareCount = 0;
const MAX_SQUARES = 15;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('whiteSquare', 40, 40);
  graphics.destroy();

  // 创建一个容器来存放所有方块（可选，方便管理）
  const squaresContainer = this.add.container(0, 0);

  // 创建定时器，每1秒生成一个方块
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒 = 1000毫秒
    callback: spawnSquare,      // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });

  // 生成方块的函数
  function spawnSquare() {
    // 检查是否已达到最大数量
    if (squareCount >= MAX_SQUARES) {
      // 停止定时器
      if (timerEvent) {
        timerEvent.remove();
        timerEvent = null;
      }
      console.log('已生成15个方块，停止生成');
      return;
    }

    // 生成随机位置（确保方块完全在画布内）
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(20, 580);

    // 创建方块
    const square = this.add.image(x, y, 'whiteSquare');
    
    // 添加到容器（可选）
    squaresContainer.add(square);

    // 增加计数
    squareCount++;
    
    console.log(`生成第 ${squareCount} 个方块，位置: (${x}, ${y})`);
  }

  // 添加文本提示
  const infoText = this.add.text(10, 10, '方块数量: 0 / 15', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 更新文本的定时器
  this.time.addEvent({
    delay: 100,
    callback: () => {
      infoText.setText(`方块数量: ${squareCount} / ${MAX_SQUARES}`);
    },
    loop: true
  });
}

// 创建游戏实例
new Phaser.Game(config);
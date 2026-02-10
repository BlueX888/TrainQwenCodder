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
let blockCount = 0;
const MAX_BLOCKS = 15;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('whiteBlock', 40, 40);
  graphics.destroy();

  // 创建定时器，每1秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                    // 1秒 = 1000毫秒
    callback: spawnBlock,           // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true                      // 循环执行
  });

  // 添加文本提示
  this.add.text(10, 10, 'Spawning white blocks...', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示计数
  const countText = this.add.text(10, 40, `Blocks: 0 / ${MAX_BLOCKS}`, {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 生成方块的函数
  function spawnBlock() {
    if (blockCount >= MAX_BLOCKS) {
      // 达到最大数量，移除定时器
      if (timerEvent) {
        timerEvent.remove();
        timerEvent = null;
      }
      countText.setText(`Blocks: ${blockCount} / ${MAX_BLOCKS} (Complete!)`);
      return;
    }

    // 生成随机位置（确保方块完全在画布内）
    const x = Phaser.Math.Between(20, 780);
    const y = Phaser.Math.Between(80, 580);

    // 创建白色方块
    const block = this.add.image(x, y, 'whiteBlock');
    block.setOrigin(0.5, 0.5);

    // 添加简单的缩放动画效果
    this.tweens.add({
      targets: block,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // 增加计数
    blockCount++;
    countText.setText(`Blocks: ${blockCount} / ${MAX_BLOCKS}`);
  }
}

// 创建游戏实例
new Phaser.Game(config);
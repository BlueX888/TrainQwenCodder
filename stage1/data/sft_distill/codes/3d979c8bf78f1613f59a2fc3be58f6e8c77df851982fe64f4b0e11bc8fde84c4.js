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
const MAX_BLOCKS = 10;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('purpleBlock', 50, 50);
  graphics.destroy();

  // 重置计数器
  blockCount = 0;

  // 创建定时器事件，每2秒执行一次
  timerEvent = this.time.addEvent({
    delay: 2000, // 2秒 = 2000毫秒
    callback: spawnBlock,
    callbackScope: this,
    loop: true
  });

  // 添加提示文本
  this.add.text(10, 10, '紫色方块生成中...', {
    fontSize: '20px',
    color: '#ffffff'
  });

  // 显示计数文本
  const countText = this.add.text(10, 40, `已生成: ${blockCount}/${MAX_BLOCKS}`, {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 生成方块的函数
  function spawnBlock() {
    if (blockCount >= MAX_BLOCKS) {
      // 达到最大数量，停止定时器
      timerEvent.remove();
      countText.setText(`已生成: ${blockCount}/${MAX_BLOCKS} (完成)`);
      countText.setColor('#00ff00');
      return;
    }

    // 生成随机位置（确保方块完全在画布内）
    const x = Phaser.Math.Between(25, 775); // 50/2 = 25 边距
    const y = Phaser.Math.Between(100, 575); // 留出顶部空间和底部边距

    // 创建紫色方块
    const block = this.add.image(x, y, 'purpleBlock');
    
    // 添加简单的出现动画
    block.setScale(0);
    this.tweens.add({
      targets: block,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // 增加计数
    blockCount++;
    countText.setText(`已生成: ${blockCount}/${MAX_BLOCKS}`);
  }
}

new Phaser.Game(config);
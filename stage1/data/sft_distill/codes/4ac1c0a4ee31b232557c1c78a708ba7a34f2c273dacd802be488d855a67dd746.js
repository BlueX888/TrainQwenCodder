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
  // 不需要加载外部资源
}

function create() {
  // 重置计数器
  blockCount = 0;
  
  // 使用 Graphics 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('whiteBlock', 40, 40);
  graphics.destroy();
  
  // 创建定时器事件，每隔1秒生成一个方块
  timerEvent = this.time.addEvent({
    delay: 1000,                    // 1秒 = 1000毫秒
    callback: spawnBlock,           // 回调函数
    callbackScope: this,            // 回调函数的作用域
    loop: true                      // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '白色方块生成中...', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 添加计数显示
  this.countText = this.add.text(10, 40, `方块数量: 0 / ${MAX_BLOCKS}`, {
    fontSize: '18px',
    color: '#ffffff'
  });
}

/**
 * 生成方块的函数
 */
function spawnBlock() {
  // 检查是否已达到最大数量
  if (blockCount >= MAX_BLOCKS) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 更新提示文本
    if (this.countText) {
      this.countText.setText(`方块数量: ${blockCount} / ${MAX_BLOCKS} (已完成)`);
    }
    
    return;
  }
  
  // 生成随机位置（考虑方块大小，避免超出边界）
  const x = Phaser.Math.Between(20, 780);
  const y = Phaser.Math.Between(80, 580);
  
  // 创建白色方块
  const block = this.add.image(x, y, 'whiteBlock');
  
  // 添加简单的出现动画
  block.setScale(0);
  this.tweens.add({
    targets: block,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  blockCount++;
  
  // 更新计数显示
  if (this.countText) {
    this.countText.setText(`方块数量: ${blockCount} / ${MAX_BLOCKS}`);
  }
}

// 创建游戏实例
new Phaser.Game(config);
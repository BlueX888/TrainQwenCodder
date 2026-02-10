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
const MAX_BLOCKS = 12;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 重置计数器
  blockCount = 0;
  
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 40, 40); // 40x40 的方块
  graphics.generateTexture('grayBlock', 40, 40);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建定时器事件，每4秒执行一次
  timerEvent = this.time.addEvent({
    delay: 4000, // 4秒 = 4000毫秒
    callback: spawnBlock,
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '灰色方块生成器', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  this.blockCountText = this.add.text(10, 40, `方块数量: 0 / ${MAX_BLOCKS}`, {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function spawnBlock() {
  // 检查是否已达到最大数量
  if (blockCount >= MAX_BLOCKS) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    
    // 更新提示文本
    this.blockCountText.setText(`方块数量: ${blockCount} / ${MAX_BLOCKS} (已完成)`);
    return;
  }
  
  // 生成随机位置
  // 确保方块完全在画布内（考虑方块大小40x40）
  const x = Phaser.Math.Between(20, 780);
  const y = Phaser.Math.Between(80, 580);
  
  // 创建方块
  const block = this.add.image(x, y, 'grayBlock');
  
  // 添加简单的缩放动画效果
  block.setScale(0);
  this.tweens.add({
    targets: block,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 增加计数
  blockCount++;
  
  // 更新计数文本
  this.blockCountText.setText(`方块数量: ${blockCount} / ${MAX_BLOCKS}`);
}

// 创建游戏实例
new Phaser.Game(config);
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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 存储所有方块的数组
  this.squares = [];
  
  // 最大方块数量
  const MAX_SQUARES = 3;
  
  // 方块尺寸
  const SQUARE_SIZE = 50;
  
  // 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, SQUARE_SIZE, SQUARE_SIZE);
  graphics.generateTexture('redSquare', SQUARE_SIZE, SQUARE_SIZE);
  graphics.destroy();
  
  // 生成方块的函数
  const spawnSquare = () => {
    // 检查是否已达到最大数量
    if (this.squares.length >= MAX_SQUARES) {
      return;
    }
    
    // 生成随机位置（确保方块完全在画布内）
    const x = Phaser.Math.Between(SQUARE_SIZE / 2, config.width - SQUARE_SIZE / 2);
    const y = Phaser.Math.Between(SQUARE_SIZE / 2, config.height - SQUARE_SIZE / 2);
    
    // 创建方块
    const square = this.add.image(x, y, 'redSquare');
    
    // 添加到数组
    this.squares.push(square);
    
    console.log(`生成方块 #${this.squares.length}，位置: (${x}, ${y})`);
  };
  
  // 创建定时器事件，每0.5秒执行一次
  this.time.addEvent({
    delay: 500,              // 延迟500毫秒（0.5秒）
    callback: spawnSquare,   // 回调函数
    callbackScope: this,     // 回调作用域
    loop: true               // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每0.5秒生成一个红色方块\n最多生成3个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
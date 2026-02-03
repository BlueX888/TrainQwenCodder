const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let squareCount = 0;
let timerEvent = null;
const MAX_SQUARES = 3;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy();

  // 创建定时器，每 0.5 秒生成一个方块
  timerEvent = this.time.addEvent({
    delay: 500,  // 0.5 秒 = 500 毫秒
    callback: spawnSquare,
    callbackScope: this,
    loop: true
  });
}

function spawnSquare() {
  // 检查是否已经生成了 3 个方块
  if (squareCount >= MAX_SQUARES) {
    // 达到最大数量，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }

  // 生成随机位置 (考虑方块大小，避免超出边界)
  const x = Phaser.Math.Between(25, 775);
  const y = Phaser.Math.Between(25, 575);

  // 创建红色方块
  const square = this.add.image(x, y, 'redSquare');
  
  // 增加计数器
  squareCount++;

  console.log(`生成第 ${squareCount} 个方块，位置: (${x}, ${y})`);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);
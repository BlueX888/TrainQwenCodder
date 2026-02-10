const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let square;
let velocityX = 80;
let velocityY = 80;
const squareSize = 50;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用Graphics绘制红色方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, squareSize, squareSize);
  graphics.generateTexture('redSquare', squareSize, squareSize);
  graphics.destroy();

  // 创建方块精灵，放置在画布中心
  square = this.add.sprite(400, 300, 'redSquare');
  square.setOrigin(0.5, 0.5);
}

function update(time, delta) {
  // 将delta转换为秒（delta是毫秒）
  const deltaSeconds = delta / 1000;

  // 更新方块位置
  square.x += velocityX * deltaSeconds;
  square.y += velocityY * deltaSeconds;

  // 计算方块的边界
  const halfSize = squareSize / 2;
  const leftEdge = square.x - halfSize;
  const rightEdge = square.x + halfSize;
  const topEdge = square.y - halfSize;
  const bottomEdge = square.y + halfSize;

  // 检测左右边界碰撞
  if (leftEdge <= 0) {
    square.x = halfSize;
    velocityX = Math.abs(velocityX); // 向右反弹
  } else if (rightEdge >= 800) {
    square.x = 800 - halfSize;
    velocityX = -Math.abs(velocityX); // 向左反弹
  }

  // 检测上下边界碰撞
  if (topEdge <= 0) {
    square.y = halfSize;
    velocityY = Math.abs(velocityY); // 向下反弹
  } else if (bottomEdge >= 600) {
    square.y = 600 - halfSize;
    velocityY = -Math.abs(velocityY); // 向上反弹
  }
}

new Phaser.Game(config);
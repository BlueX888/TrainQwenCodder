const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let star;
let cursors;
const SPEED = 360;

function preload() {
  // 使用 Graphics 绘制紫色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillStar(32, 32, 5, 16, 32, 0); // 5个角的星形
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建星形精灵，初始位置在画布中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将速度从每秒像素转换为每帧像素
  const velocity = SPEED * (delta / 1000);
  
  // 根据方向键控制移动
  if (cursors.left.isDown) {
    star.x -= velocity;
  }
  if (cursors.right.isDown) {
    star.x += velocity;
  }
  if (cursors.up.isDown) {
    star.y -= velocity;
  }
  if (cursors.down.isDown) {
    star.y += velocity;
  }
  
  // 限制在画布边界内（考虑星形半径32）
  const halfWidth = 32;
  const halfHeight = 32;
  
  if (star.x < halfWidth) {
    star.x = halfWidth;
  }
  if (star.x > config.width - halfWidth) {
    star.x = config.width - halfWidth;
  }
  if (star.y < halfHeight) {
    star.y = halfHeight;
  }
  if (star.y > config.height - halfHeight) {
    star.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);
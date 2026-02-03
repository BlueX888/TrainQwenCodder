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
  // 使用 Graphics 绘制紫色星形并生成纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillStar(25, 25, 5, 20, 10, 0); // 中心(25,25), 5个角, 外半径20, 内半径10
  graphics.generateTexture('starTexture', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建星形精灵，初始位置在画布中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 获取方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move the Star', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键状态
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }
  
  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 对角线移动时归一化速度（避免斜向移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新星形位置
  star.x += velocityX * moveDistance;
  star.y += velocityY * moveDistance;
  
  // 限制在画布边界内（考虑星形半径约25像素）
  const halfWidth = star.width / 2;
  const halfHeight = star.height / 2;
  
  if (star.x < halfWidth) {
    star.x = halfWidth;
  } else if (star.x > config.width - halfWidth) {
    star.x = config.width - halfWidth;
  }
  
  if (star.y < halfHeight) {
    star.y = halfHeight;
  } else if (star.y > config.height - halfHeight) {
    star.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);
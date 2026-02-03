const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let star;
let cursors;
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形（5个角，外半径30，内半径15）
  graphics.fillStar(32, 32, 5, 15, 30);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在画布中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算本帧移动距离
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
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
  
  // 归一化对角线移动（避免对角线速度过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新位置
  star.x += velocityX * moveDistance;
  star.y += velocityY * moveDistance;
  
  // 限制在画布边界内（考虑星形的半径约为30）
  const halfWidth = star.width / 2;
  const halfHeight = star.height / 2;
  
  star.x = Phaser.Math.Clamp(star.x, halfWidth, config.width - halfWidth);
  star.y = Phaser.Math.Clamp(star.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);
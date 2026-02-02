const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 360;

function preload() {
  // 使用 Graphics 生成蓝色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillEllipse(40, 30, 80, 60);
  graphics.generateTexture('blueEllipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'blueEllipse');
  
  // 获取方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 转换为秒
  const deltaSeconds = delta / 1000;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -SPEED;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
  }
  
  if (cursors.up.isDown) {
    velocityY = -SPEED;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
  }
  
  // 更新位置
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;
  
  // 限制在画布边界内
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  if (player.x < halfWidth) {
    player.x = halfWidth;
  } else if (player.x > config.width - halfWidth) {
    player.x = config.width - halfWidth;
  }
  
  if (player.y < halfHeight) {
    player.y = halfHeight;
  } else if (player.y > config.height - halfHeight) {
    player.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);
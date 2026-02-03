const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 300;

function preload() {
  // 使用 Graphics 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算每帧移动距离
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -moveDistance;
  } else if (cursors.right.isDown) {
    velocityX = moveDistance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -moveDistance;
  } else if (cursors.down.isDown) {
    velocityY = moveDistance;
  }
  
  // 更新玩家位置
  player.x += velocityX;
  player.y += velocityY;
  
  // 限制在画布边界内
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);
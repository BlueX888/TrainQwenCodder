const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 80;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(20, 20, 20); // 中心点(20,20)，半径20
  
  // 生成纹理
  graphics.generateTexture('playerCircle', 40, 40);
  graphics.destroy();
  
  // 创建带物理属性的玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerCircle');
  
  // 设置碰撞边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(SPEED);
  }
  
  // 处理斜向移动时的速度归一化
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      // 斜向移动时，调整速度保持总速度为 SPEED
      const normalizedSpeed = SPEED / Math.sqrt(2);
      player.setVelocity(
        player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }
  }
}

new Phaser.Game(config);
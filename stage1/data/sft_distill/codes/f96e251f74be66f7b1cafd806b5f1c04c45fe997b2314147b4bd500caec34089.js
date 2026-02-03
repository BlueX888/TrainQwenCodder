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
const SPEED = 160;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建青色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(25, 25, 50, 30); // 在中心绘制椭圆
  graphics.generateTexture('ellipse', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置碰撞世界边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);

  // 根据方向键设置速度
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

  // 对角线移动时归一化速度，保持相同速度
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      player.body.velocity.normalize().scale(SPEED);
    }
  }
}

new Phaser.Game(config);
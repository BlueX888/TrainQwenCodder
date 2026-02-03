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
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('blueEllipse', 80, 60);
  graphics.destroy();

  // 创建玩家精灵对象，位置在画布中心
  player = this.physics.add.sprite(400, 300, 'blueEllipse');
  
  // 设置碰撞边界，使其不能超出画布
  player.setCollideWorldBounds(true);

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);

  // 检测方向键输入并设置速度
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

  // 对角线移动时归一化速度，保持恒定速度
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      player.body.velocity.normalize().scale(SPEED);
    }
  }
}

new Phaser.Game(config);
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
const MOVE_SPEED = 360;

function preload() {
  // 使用 Graphics 创建蓝色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillEllipse(30, 30, 60, 40); // 中心点(30,30)，宽60，高40
  graphics.generateTexture('blueEllipse', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'blueEllipse');
  
  // 设置精灵属性
  player.setCollideWorldBounds(true); // 限制在画布边界内
  player.setDamping(true); // 启用阻尼
  player.setDrag(0.99); // 设置阻力，使停止更自然
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-MOVE_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(MOVE_SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-MOVE_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(MOVE_SPEED);
  }
  
  // 如果同时按下两个方向键，归一化速度向量以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(MOVE_SPEED);
  }
}

new Phaser.Game(config);
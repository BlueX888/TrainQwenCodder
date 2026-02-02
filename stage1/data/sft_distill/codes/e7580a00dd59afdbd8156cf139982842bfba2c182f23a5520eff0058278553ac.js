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

let ellipse;
let cursors;
const SPEED = 120;

function preload() {
  // 使用 Graphics 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(25, 25, 50, 50); // 中心点(25,25)，宽高50
  graphics.generateTexture('ellipse', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建带物理属性的椭圆精灵，初始位置在画布中心
  ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置椭圆与世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update() {
  // 重置速度
  ellipse.setVelocity(0, 0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    ellipse.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    ellipse.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    ellipse.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    ellipse.setVelocityY(SPEED);
  }
  
  // 如果同时按下两个方向键，需要归一化速度以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    ellipse.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);
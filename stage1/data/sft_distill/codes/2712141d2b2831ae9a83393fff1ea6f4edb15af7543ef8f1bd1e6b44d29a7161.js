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

function preload() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('player', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵作为玩家方块
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 添加 WASD 键盘控制
  cursors = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  const speed = 360;
  
  // 处理水平移动
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }
  
  // 处理垂直移动
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(speed);
  }
}

new Phaser.Game(config);
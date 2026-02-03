const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  }
};

let player;
let keys;
const SPEED = 160;

function preload() {
  // 使用 Graphics 创建三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个指向上方的三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(20, 0);      // 顶点
  graphics.lineTo(40, 40);     // 右下角
  graphics.lineTo(0, 40);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理精灵并设置三角形纹理
  player = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置碰撞边界，防止精灵移出屏幕
  player.setCollideWorldBounds(true);
  
  // 创建 WASD 键盘监听
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the triangle', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 根据按键设置速度
  if (keys.W.isDown) {
    player.setVelocityY(-SPEED);
  }
  if (keys.S.isDown) {
    player.setVelocityY(SPEED);
  }
  if (keys.A.isDown) {
    player.setVelocityX(-SPEED);
  }
  if (keys.D.isDown) {
    player.setVelocityX(SPEED);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量以保持恒定速度
  if ((keys.W.isDown || keys.S.isDown) && (keys.A.isDown || keys.D.isDown)) {
    const velocity = player.body.velocity;
    velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);
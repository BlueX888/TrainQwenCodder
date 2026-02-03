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
let enemy;
let cursors;
let survivalTime = 0; // 状态信号：存活时间
let collisionCount = 0; // 状态信号：碰撞次数
let timeText;
let collisionText;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（橙色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff8800, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, onCollision, null, this);

  // 创建UI文本显示状态信号
  timeText = this.add.text(16, 16, 'Survival Time: 0s', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  collisionText = this.add.text(16, 40, 'Collisions: 0', {
    fontSize: '18px',
    fill: '#ff0000'
  });

  // 添加说明文本
  this.add.text(16, 70, 'Use Arrow Keys to Move', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  this.add.text(16, 90, 'Player Speed: 240 | Enemy Speed: 200', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 更新存活时间
  survivalTime += delta / 1000;
  timeText.setText('Survival Time: ' + survivalTime.toFixed(1) + 's');

  // 玩家移动控制（速度 200 * 1.2 = 240）
  const playerSpeed = 240;
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(playerSpeed);
  }

  // 敌人追踪玩家（速度 200）
  const enemySpeed = 200;
  this.physics.moveToObject(enemy, player, enemySpeed);
}

function onCollision(player, enemy) {
  // 碰撞时增加计数
  collisionCount++;
  collisionText.setText('Collisions: ' + collisionCount);

  // 碰撞后将敌人推开一小段距离
  const angle = Phaser.Math.Angle.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );
  
  enemy.x = player.x + Math.cos(angle) * 100;
  enemy.y = player.y + Math.sin(angle) * 100;

  // 闪烁效果提示碰撞
  player.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    player.clearTint();
  });
}

new Phaser.Game(config);
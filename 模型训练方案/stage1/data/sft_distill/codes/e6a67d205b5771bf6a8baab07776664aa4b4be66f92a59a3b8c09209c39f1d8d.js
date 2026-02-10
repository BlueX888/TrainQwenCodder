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
let statusText;
let collisionCount = 0;
let lastCollisionTime = 0;

const PLAYER_SPEED = 300 * 1.2; // 360
const ENEMY_SPEED = 300;

function preload() {
  // 生成玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x3498db, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 生成敌人纹理（粉色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff69b4, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 创建状态文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(10, 550, '使用方向键移动 | 玩家速度: 360 | 敌人速度: 300', {
    fontSize: '14px',
    fill: '#cccccc'
  });

  updateStatusText();
}

function update(time, delta) {
  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }

  // 对角线移动速度归一化
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 更新状态文本
  updateStatusText();
}

function handleCollision(player, enemy) {
  const currentTime = Date.now();
  
  // 防止重复计数（500ms 内只计数一次）
  if (currentTime - lastCollisionTime > 500) {
    collisionCount++;
    lastCollisionTime = currentTime;
    
    // 碰撞时敌人短暂后退
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    enemy.setVelocity(
      -Math.cos(angle) * ENEMY_SPEED * 2,
      -Math.sin(angle) * ENEMY_SPEED * 2
    );
  }
}

function updateStatusText() {
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  statusText.setText([
    `玩家位置: (${Math.floor(player.x)}, ${Math.floor(player.y)})`,
    `敌人位置: (${Math.floor(enemy.x)}, ${Math.floor(enemy.y)})`,
    `距离: ${Math.floor(distance)}`,
    `碰撞次数: ${collisionCount}`,
    `玩家速度: ${PLAYER_SPEED} | 敌人速度: ${ENEMY_SPEED}`
  ]);
}

new Phaser.Game(config);
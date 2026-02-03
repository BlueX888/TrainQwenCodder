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
  }
};

let player;
let enemy;
let cursors;
let healthText;
let health = 3;
let canTakeDamage = true;
let enemyDirection = 1;

function preload() {
  // 使用 Graphics 生成玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 使用 Graphics 生成敌人纹理（红色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建背景（用于观察震屏效果）
  const bg = this.add.graphics();
  bg.fillStyle(0x222222, 1);
  bg.fillRect(0, 0, 1600, 1200);
  
  // 添加网格线（帮助观察震屏）
  bg.lineStyle(1, 0x444444, 1);
  for (let i = 0; i < 1600; i += 100) {
    bg.lineBetween(i, 0, i, 1200);
  }
  for (let j = 0; j < 1200; j += 100) {
    bg.lineBetween(0, j, 1600, j);
  }

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 1600, 1200);
  
  // 创建敌人
  enemy = this.physics.add.sprite(600, 300, 'enemy');
  enemy.setVelocityX(100);

  // 设置镜头跟随玩家
  this.cameras.main.setBounds(0, 0, 1600, 1200);
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  this.cameras.main.setZoom(1);

  // 创建生命值显示（固定在屏幕左上角）
  healthText = this.add.text(16, 16, 'Health: 3', {
    fontSize: '32px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  healthText.setScrollFactor(0); // 固定在屏幕上，不随镜头移动

  // 添加碰撞检测
  this.physics.add.collider(player, enemy, handleCollision, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  const hintText = this.add.text(16, 60, 'Arrow keys to move\nCollide with red enemy to trigger shake', {
    fontSize: '18px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  hintText.setScrollFactor(0);
}

function update(time, delta) {
  // 玩家移动控制
  const speed = 200;
  
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  } else {
    player.setVelocityY(0);
  }

  // 敌人巡逻逻辑（左右移动）
  if (enemy.x <= 100) {
    enemyDirection = 1;
    enemy.setVelocityX(100);
  } else if (enemy.x >= 1500) {
    enemyDirection = -1;
    enemy.setVelocityX(-100);
  }

  // 检查游戏结束
  if (health <= 0) {
    healthText.setText('Health: 0 - GAME OVER!');
    healthText.setStyle({ fill: '#ff0000' });
    this.physics.pause();
  }
}

function handleCollision(player, enemy) {
  // 防止连续触发（无敌时间）
  if (!canTakeDamage) {
    return;
  }

  canTakeDamage = false;

  // 扣减生命值
  health -= 1;
  healthText.setText('Health: ' + health);

  // 触发镜头震动 0.5 秒
  this.cameras.main.shake(500, 0.01);

  // 玩家闪烁效果
  player.setTint(0xff0000);
  
  // 击退效果
  const knockbackX = player.x < enemy.x ? -200 : 200;
  player.setVelocity(knockbackX, -100);

  // 0.5秒后恢复
  this.time.delayedCall(500, () => {
    player.clearTint();
    canTakeDamage = true;
  });

  // 输出状态信号（用于验证）
  console.log('Collision! Health:', health, 'Camera shake triggered');
}

// 创建游戏实例
const game = new Phaser.Game(config);
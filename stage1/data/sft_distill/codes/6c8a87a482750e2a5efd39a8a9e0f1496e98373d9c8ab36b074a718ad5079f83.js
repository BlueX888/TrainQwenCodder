const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
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
let enemies;
let cursors;
let healthText;
let playerHealth = 100;
let canTakeDamage = true;
let damageTimer = 0;
let camera;

function preload() {
  // 使用Graphics生成玩家纹理
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 使用Graphics生成敌人纹理
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 30, 30);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(600, 400, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.8);
  player.setMaxVelocity(300);

  // 创建敌人组
  enemies = this.physics.add.group();
  
  // 在场景中随机生成5个敌人
  for (let i = 0; i < 5; i++) {
    const x = Phaser.Math.Between(100, 1100);
    const y = Phaser.Math.Between(100, 700);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 给敌人随机速度
    const velocityX = Phaser.Math.Between(-100, 100);
    const velocityY = Phaser.Math.Between(-100, 100);
    enemy.setVelocity(velocityX, velocityY);
    enemy.setBounce(1, 1);
  }

  // 设置镜头跟随玩家
  camera = this.cameras.main;
  camera.startFollow(player, true, 0.1, 0.1);
  camera.setBounds(0, 0, 1200, 800);

  // 设置世界边界
  this.physics.world.setBounds(0, 0, 1200, 800);

  // 添加碰撞检测
  this.physics.add.collider(player, enemies, handlePlayerEnemyCollision, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建生命值文本（固定在镜头上）
  healthText = this.add.text(16, 16, `Health: ${playerHealth}`, {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  healthText.setScrollFactor(0); // 固定在镜头上不随镜头移动

  // 添加提示文本
  const instructionText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#cccccc',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });
  instructionText.setScrollFactor(0);

  // 添加状态信息文本
  const statusText = this.add.text(16, 80, 'Collide with enemies to trigger shake!', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });
  statusText.setScrollFactor(0);
}

function update(time, delta) {
  // 玩家移动控制
  const acceleration = 400;

  if (cursors.left.isDown) {
    player.setAccelerationX(-acceleration);
  } else if (cursors.right.isDown) {
    player.setAccelerationX(acceleration);
  } else {
    player.setAccelerationX(0);
  }

  if (cursors.up.isDown) {
    player.setAccelerationY(-acceleration);
  } else if (cursors.down.isDown) {
    player.setAccelerationY(acceleration);
  } else {
    player.setAccelerationY(0);
  }

  // 更新生命值显示
  healthText.setText(`Health: ${playerHealth}`);

  // 处理无敌时间
  if (!canTakeDamage) {
    damageTimer -= delta;
    if (damageTimer <= 0) {
      canTakeDamage = true;
      player.clearTint();
    }
  }

  // 检查游戏结束
  if (playerHealth <= 0) {
    healthText.setText('Health: 0 - GAME OVER!');
    healthText.setColor('#ff0000');
    this.physics.pause();
  }
}

function handlePlayerEnemyCollision(player, enemy) {
  // 只有在可以受伤的状态下才处理碰撞
  if (canTakeDamage && playerHealth > 0) {
    // 扣减生命值
    playerHealth -= 10;
    
    // 触发镜头震动效果（2.5秒，强度0.01）
    camera.shake(2500, 0.01);
    
    // 设置无敌时间（2.5秒）
    canTakeDamage = false;
    damageTimer = 2500;
    
    // 玩家闪烁效果
    player.setTint(0xff0000);
    
    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    const knockbackForce = 300;
    player.setVelocity(
      Math.cos(angle) * knockbackForce,
      Math.sin(angle) * knockbackForce
    );
    
    console.log(`Player hit! Health: ${playerHealth}`);
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);
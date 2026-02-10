// Phaser3 追踪镜头与震屏实现
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

// 全局信号对象
window.__signals__ = {
  health: 100,
  collisions: 0,
  shakeActive: false,
  events: []
};

let player;
let enemies;
let cursors;
let healthText;
let playerHealth = 100;
let isShaking = false;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0.2);

  // 摄像机追踪玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  this.cameras.main.setBounds(0, 0, 1600, 1200);
  this.physics.world.setBounds(0, 0, 1600, 1200);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 在场景中随机生成5个敌人
  for (let i = 0; i < 5; i++) {
    const x = Phaser.Math.Between(100, 1500);
    const y = Phaser.Math.Between(100, 1100);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }

  // 添加碰撞检测
  this.physics.add.collider(player, enemies, handleCollision, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建生命值文本（固定在摄像机上）
  healthText = this.add.text(16, 16, `Health: ${playerHealth}`, {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  healthText.setScrollFactor(0); // 固定在摄像机视口

  // 添加提示文本
  const instructionText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#cccccc',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  });
  instructionText.setScrollFactor(0);

  // 记录初始化事件
  logEvent('game_start', { health: playerHealth });
}

function update() {
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
}

function handleCollision(player, enemy) {
  // 避免重复触发
  if (isShaking) {
    return;
  }

  // 扣减生命值
  playerHealth -= 10;
  if (playerHealth < 0) {
    playerHealth = 0;
  }

  // 更新生命值显示
  healthText.setText(`Health: ${playerHealth}`);

  // 更新信号
  window.__signals__.health = playerHealth;
  window.__signals__.collisions += 1;
  window.__signals__.shakeActive = true;

  // 记录碰撞事件
  logEvent('collision', {
    health: playerHealth,
    collisionCount: window.__signals__.collisions,
    playerPos: { x: player.x, y: player.y },
    enemyPos: { x: enemy.x, y: enemy.y }
  });

  // 触发镜头震动 4 秒
  isShaking = true;
  this.cameras.main.shake(4000, 0.01);

  // 4秒后重置震动状态
  this.time.delayedCall(4000, () => {
    isShaking = false;
    window.__signals__.shakeActive = false;
    logEvent('shake_end', { health: playerHealth });
  });

  // 生命值为0时游戏结束
  if (playerHealth <= 0) {
    logEvent('game_over', { totalCollisions: window.__signals__.collisions });
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
  }
}

function logEvent(eventType, data) {
  const event = {
    type: eventType,
    timestamp: Date.now(),
    data: data
  };
  
  window.__signals__.events.push(event);
  console.log(JSON.stringify(event));
}

// 启动游戏
new Phaser.Game(config);
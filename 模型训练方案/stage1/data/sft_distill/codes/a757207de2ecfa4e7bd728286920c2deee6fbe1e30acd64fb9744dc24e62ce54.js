const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
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
let enemies;
let cursors;
let statusText;

// 状态信号变量
let gameState = {
  enemiesTracking: 0,  // 正在追踪的敌人数量
  playerAlive: true,    // 玩家存活状态
  totalEnemies: 20      // 敌人总数
};

const PATROL_SPEED = 360;
const CHASE_SPEED = 400;
const DETECTION_RANGE = 250;
const PATROL_RANGE = 150;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（粉色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff69b4, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(600, 400, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.8);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成20个敌人，分布在场景中
  for (let i = 0; i < 20; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 150 + col * 250;
    const y = 100 + row * 150;
    
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1);
    
    // 自定义属性：巡逻相关
    enemy.patrolStartX = x;
    enemy.patrolDirection = Math.random() > 0.5 ? 1 : -1;
    enemy.isChasing = false;
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
  }

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 玩家与敌人碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 添加说明文本
  this.add.text(16, 750, '方向键移动 | 远离敌人巡逻，靠近敌人追踪', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  if (!gameState.playerAlive) {
    return;
  }

  // 玩家移动控制
  const playerSpeed = 300;
  
  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
  } else {
    player.setVelocityY(0);
  }

  // 重置追踪计数
  gameState.enemiesTracking = 0;

  // 敌人AI逻辑
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    if (distance < DETECTION_RANGE) {
      // 追踪模式
      if (!enemy.isChasing) {
        enemy.isChasing = true;
        enemy.setTint(0xff0000); // 追踪时变红色
      }
      
      gameState.enemiesTracking++;

      // 计算追踪方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      
      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );
    } else {
      // 巡逻模式
      if (enemy.isChasing) {
        enemy.isChasing = false;
        enemy.clearTint(); // 恢复粉色
      }

      // 检查是否超出巡逻范围
      const distanceFromStart = Math.abs(enemy.x - enemy.patrolStartX);
      
      if (distanceFromStart > PATROL_RANGE) {
        // 反向巡逻
        enemy.patrolDirection *= -1;
      }

      // 设置巡逻速度
      enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      enemy.setVelocityY(0);
    }
  });

  // 更新状态文本
  statusText.setText([
    `玩家存活: ${gameState.playerAlive ? '是' : '否'}`,
    `敌人总数: ${gameState.totalEnemies}`,
    `追踪中: ${gameState.enemiesTracking}`,
    `巡逻中: ${gameState.totalEnemies - gameState.enemiesTracking}`,
    `玩家位置: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  ]);
}

function hitEnemy(player, enemy) {
  // 玩家被敌人碰到
  if (gameState.playerAlive) {
    gameState.playerAlive = false;
    player.setTint(0xff0000);
    player.setVelocity(0, 0);
    
    // 停止所有敌人
    enemies.children.entries.forEach(e => {
      e.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    const gameOverText = this.add.text(600, 400, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    gameOverText.setOrigin(0.5);

    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
      gameState.playerAlive = true;
      gameState.enemiesTracking = 0;
    });
  }
}

new Phaser.Game(config);
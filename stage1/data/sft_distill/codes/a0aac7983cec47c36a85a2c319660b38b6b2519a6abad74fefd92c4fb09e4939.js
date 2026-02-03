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
let enemies;
let cursors;
let statusText;

// 状态信号变量
let gameState = {
  playerHealth: 100,
  enemiesAlive: 15,
  playerHits: 0
};

const PATROL_SPEED = 300;
const CHASE_SPEED = 350;
const DETECTION_RANGE = 200;
const PATROL_RANGE = 150;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
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
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(28, 28);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成 15 个敌人，分布在场景中
  const positions = [
    { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 }, { x: 700, y: 100 },
    { x: 150, y: 250 }, { x: 350, y: 250 }, { x: 550, y: 250 }, { x: 650, y: 250 },
    { x: 100, y: 400 }, { x: 250, y: 400 }, { x: 450, y: 400 }, { x: 600, y: 400 },
    { x: 200, y: 500 }, { x: 400, y: 500 }, { x: 700, y: 500 }
  ];

  positions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.body.setBounce(0);
    
    // 为每个敌人添加自定义属性
    enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 交替初始方向
    enemy.startX = pos.x;
    enemy.isChasing = false;
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();
}

function update(time, delta) {
  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-250);
  } else if (cursors.right.isDown) {
    player.setVelocityX(250);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-250);
  } else if (cursors.down.isDown) {
    player.setVelocityY(250);
  }

  // 敌人 AI 逻辑
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 检测是否在追踪范围内
    if (distance < DETECTION_RANGE) {
      // 追踪模式
      enemy.isChasing = true;
      
      // 计算朝向玩家的方向
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
        // 从追踪切换回巡逻，恢复横向移动
        enemy.isChasing = false;
        enemy.setVelocityY(0);
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }

      // 检查是否超出巡逻范围，需要转向
      const distanceFromStart = Math.abs(enemy.x - enemy.startX);
      
      if (distanceFromStart > PATROL_RANGE) {
        enemy.patrolDirection *= -1;
        enemy.setVelocityX(PATROL_SPEED * enemy.patrolDirection);
      }
    }
  });
}

function hitEnemy(player, enemy) {
  // 敌人被击中效果
  enemy.destroy();
  
  // 更新状态
  gameState.enemiesAlive--;
  gameState.playerHits++;
  
  // 创建粒子效果
  const particles = this.add.particles(enemy.x, enemy.y, 'enemy', {
    speed: { min: 50, max: 150 },
    scale: { start: 0.5, end: 0 },
    lifespan: 500,
    quantity: 8,
    blendMode: 'ADD'
  });
  
  // 500ms 后销毁粒子发射器
  this.time.delayedCall(500, () => {
    particles.destroy();
  });

  updateStatusText();

  // 检查胜利条件
  if (gameState.enemiesAlive === 0) {
    statusText.setText(
      `胜利！\n玩家生命: ${gameState.playerHealth}\n消灭敌人: ${gameState.playerHits}\n\n所有敌人已清除！`
    );
    this.physics.pause();
  }
}

function updateStatusText() {
  statusText.setText(
    `玩家生命: ${gameState.playerHealth}\n` +
    `存活敌人: ${gameState.enemiesAlive}\n` +
    `击中次数: ${gameState.playerHits}`
  );
}

new Phaser.Game(config);
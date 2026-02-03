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

// 全局信号对象
window.__signals__ = {
  playerHits: 0,
  patrollingEnemies: 0,
  chasingEnemies: 0,
  totalEnemies: 15,
  gameTime: 0
};

let player;
let enemies;
let cursors;
const ENEMY_COUNT = 15;
const PATROL_SPEED = 160;
const CHASE_DISTANCE = 150;
const PATROL_RANGE = 200;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（黄色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffff00, 1);
  enemyGraphics.fillRect(0, 0, 24, 24);
  enemyGraphics.generateTexture('enemy', 24, 24);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成15个敌人
  for (let i = 0; i < ENEMY_COUNT; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 1);
    
    // 自定义数据：巡逻起点和方向
    enemy.setData('patrolStartX', x);
    enemy.setData('patrolDirection', Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
    enemy.setData('mode', 'patrol'); // patrol 或 chase
    
    // 设置初始巡逻速度
    const direction = enemy.getData('patrolDirection');
    enemy.setVelocityX(PATROL_SPEED * direction);
  }

  // 玩家与敌人碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本显示
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  // 更新游戏时间
  window.__signals__.gameTime = Math.floor(time / 1000);

  // 玩家移动
  player.setVelocity(0);
  
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }

  // 统计数据
  let patrolCount = 0;
  let chaseCount = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    if (distance < CHASE_DISTANCE) {
      // 追踪模式
      enemy.setData('mode', 'chase');
      chaseCount++;
      
      // 计算追踪方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      
      enemy.setVelocity(
        Math.cos(angle) * PATROL_SPEED,
        Math.sin(angle) * PATROL_SPEED
      );
    } else {
      // 巡逻模式
      enemy.setData('mode', 'patrol');
      patrolCount++;
      
      const patrolStartX = enemy.getData('patrolStartX');
      const direction = enemy.getData('patrolDirection');
      
      // 检查是否超出巡逻范围
      if (Math.abs(enemy.x - patrolStartX) > PATROL_RANGE) {
        // 反转方向
        const newDirection = -direction;
        enemy.setData('patrolDirection', newDirection);
        enemy.setVelocityX(PATROL_SPEED * newDirection);
      } else {
        // 保持当前方向
        enemy.setVelocityX(PATROL_SPEED * direction);
      }
      
      enemy.setVelocityY(0);
    }
  });

  // 更新信号
  window.__signals__.patrollingEnemies = patrolCount;
  window.__signals__.chasingEnemies = chaseCount;

  // 更新显示文本
  this.statusText.setText([
    `Player Hits: ${window.__signals__.playerHits}`,
    `Patrolling: ${patrolCount}`,
    `Chasing: ${chaseCount}`,
    `Time: ${window.__signals__.gameTime}s`,
    `Use Arrow Keys to Move`
  ]);

  // 输出日志（每60帧输出一次）
  if (time % 1000 < 16) {
    console.log(JSON.stringify(window.__signals__));
  }
}

function hitEnemy(player, enemy) {
  // 玩家被敌人击中
  window.__signals__.playerHits++;
  
  // 短暂击退效果
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );
  player.setVelocity(
    Math.cos(angle) * 300,
    Math.sin(angle) * 300
  );
}

new Phaser.Game(config);
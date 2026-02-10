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
let gameState = {
  enemiesTracking: 0,  // 状态信号：正在追踪的敌人数量
  totalEnemies: 20
};

const PATROL_SPEED = 360;
const TRACK_SPEED = 360;
const TRACK_DISTANCE = 150;  // 玩家接近距离阈值
const PLAYER_SPEED = 200;

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
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成 20 个敌人，随机分布
  for (let i = 0; i < gameState.totalEnemies; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 1);
    
    // 自定义数据：巡逻状态
    enemy.setData('state', 'patrol');  // 'patrol' 或 'tracking'
    enemy.setData('patrolDirection', Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.getData('patrolDirection'));
  }

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  // 玩家移动
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

  // 重置追踪计数
  gameState.enemiesTracking = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    const currentState = enemy.getData('state');

    // 判断是否需要切换状态
    if (distance < TRACK_DISTANCE) {
      // 切换到追踪模式
      if (currentState !== 'tracking') {
        enemy.setData('state', 'tracking');
      }

      // 追踪玩家
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      
      enemy.setVelocity(
        Math.cos(angle) * TRACK_SPEED,
        Math.sin(angle) * TRACK_SPEED
      );

      // 改变颜色表示追踪状态（更亮的粉色）
      enemy.setTint(0xffb6c1);
      
      gameState.enemiesTracking++;
    } else {
      // 切换回巡逻模式
      if (currentState !== 'patrol') {
        enemy.setData('state', 'patrol');
        enemy.clearTint();
      }

      // 巡逻移动：左右往返
      const patrolDir = enemy.getData('patrolDirection');
      
      // 检测是否碰到左右边界，反转方向
      if (enemy.x <= 16 && patrolDir === -1) {
        enemy.setData('patrolDirection', 1);
        enemy.setVelocityX(PATROL_SPEED);
        enemy.setVelocityY(0);
      } else if (enemy.x >= 784 && patrolDir === 1) {
        enemy.setData('patrolDirection', -1);
        enemy.setVelocityX(-PATROL_SPEED);
        enemy.setVelocityY(0);
      } else {
        // 保持当前方向
        enemy.setVelocityX(PATROL_SPEED * enemy.getData('patrolDirection'));
        enemy.setVelocityY(0);
      }
    }
  });

  // 更新状态显示
  this.statusText.setText([
    `Total Enemies: ${gameState.totalEnemies}`,
    `Tracking: ${gameState.enemiesTracking}`,
    `Patrolling: ${gameState.totalEnemies - gameState.enemiesTracking}`,
    `Use Arrow Keys to Move`
  ]);
}

new Phaser.Game(config);
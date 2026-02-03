// 完整的 Phaser3 敌人巡逻与追踪系统
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
  patrollingEnemies: 0,
  chasingEnemies: 0,
  playerPosition: { x: 0, y: 0 },
  totalEnemies: 8
};

let player;
let enemies;
let cursors;
const PATROL_SPEED = 120;
const CHASE_SPEED = 150;
const CHASE_DISTANCE = 200; // 玩家靠近此距离时敌人开始追踪
const PATROL_BOUNDS = { left: 50, right: 750 }; // 巡逻边界

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成 8 个敌人，分布在不同位置
  const positions = [
    { x: 100, y: 100 },
    { x: 300, y: 100 },
    { x: 500, y: 100 },
    { x: 700, y: 100 },
    { x: 150, y: 400 },
    { x: 350, y: 400 },
    { x: 550, y: 400 },
    { x: 650, y: 400 }
  ];

  positions.forEach((pos, index) => {
    const enemy = enemies.create(pos.x, pos.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 为每个敌人设置自定义数据
    enemy.setData('state', 'patrol'); // patrol 或 chase
    enemy.setData('patrolDirection', index % 2 === 0 ? 1 : -1); // 1 向右，-1 向左
    enemy.setData('originalY', pos.y); // 记录初始Y坐标，保持在同一水平线
    
    // 设置初始巡逻速度
    enemy.setVelocityX(PATROL_SPEED * enemy.getData('patrolDirection'));
  });

  // 添加玩家与敌人碰撞（可选，这里仅作演示）
  this.physics.add.overlap(player, enemies, handlePlayerEnemyCollision, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文字
  this.add.text(10, 10, '使用方向键移动玩家\n靠近敌人会被追踪', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加状态显示文字
  this.statusText = this.add.text(10, 550, '', {
    fontSize: '14px',
    fill: '#ffff00'
  });
}

function update(time, delta) {
  // 玩家移动控制
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

  // 更新信号
  window.__signals__.playerPosition = { x: player.x, y: player.y };
  let patrolCount = 0;
  let chaseCount = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distanceToPlayer = Phaser.Math.Distance.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    // 判断是否应该追踪玩家
    if (distanceToPlayer < CHASE_DISTANCE) {
      // 切换到追踪模式
      enemy.setData('state', 'chase');
      
      // 计算朝向玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        player.x, player.y
      );
      
      // 设置追踪速度
      enemy.setVelocity(
        Math.cos(angle) * CHASE_SPEED,
        Math.sin(angle) * CHASE_SPEED
      );
      
      chaseCount++;
    } else {
      // 切换到巡逻模式
      enemy.setData('state', 'patrol');
      
      // 巡逻逻辑：左右往返
      const patrolDirection = enemy.getData('patrolDirection');
      const originalY = enemy.getData('originalY');
      
      // 保持在原始Y坐标附近
      enemy.y = originalY;
      
      // 检查是否到达边界，反向
      if (enemy.x <= PATROL_BOUNDS.left && patrolDirection === -1) {
        enemy.setData('patrolDirection', 1);
        enemy.setVelocityX(PATROL_SPEED);
      } else if (enemy.x >= PATROL_BOUNDS.right && patrolDirection === 1) {
        enemy.setData('patrolDirection', -1);
        enemy.setVelocityX(-PATROL_SPEED);
      } else {
        // 继续当前方向巡逻
        enemy.setVelocityX(PATROL_SPEED * enemy.getData('patrolDirection'));
      }
      
      enemy.setVelocityY(0);
      patrolCount++;
    }
  });

  // 更新信号
  window.__signals__.patrollingEnemies = patrolCount;
  window.__signals__.chasingEnemies = chaseCount;

  // 更新状态文字
  this.statusText.setText(
    `巡逻: ${patrolCount} | 追踪: ${chaseCount}`
  );

  // 输出日志（每60帧输出一次，避免过多日志）
  if (time % 1000 < 20) {
    console.log(JSON.stringify({
      timestamp: time,
      patrolling: patrolCount,
      chasing: chaseCount,
      playerPos: { x: Math.round(player.x), y: Math.round(player.y) }
    }));
  }
}

function handlePlayerEnemyCollision(player, enemy) {
  // 碰撞处理（可选实现，这里仅作演示）
  // 例如：玩家生命值减少、游戏结束等
  console.log('Player hit by enemy!');
}

// 启动游戏
new Phaser.Game(config);
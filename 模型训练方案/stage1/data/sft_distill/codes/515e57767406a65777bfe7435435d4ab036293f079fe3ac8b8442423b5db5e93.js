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
let enemyStates = {
  patrolling: 0,
  chasing: 0
};

const PATROL_SPEED = 200;
const CHASE_SPEED = 250;
const DETECTION_RANGE = 150;
const PATROL_RANGE = 150;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（黄色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffff00, 1);
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

  // 创建3个敌人，每个有自己的巡逻区域
  const enemyData = [
    { x: 200, y: 150, startX: 200 },
    { x: 400, y: 400, startX: 400 },
    { x: 600, y: 250, startX: 600 }
  ];

  enemyData.forEach(data => {
    const enemy = enemies.create(data.x, data.y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 自定义数据：巡逻状态
    enemy.setData('state', 'patrol');
    enemy.setData('direction', 1); // 1: 右, -1: 左
    enemy.setData('startX', data.startX); // 巡逻起点
    enemy.setData('patrolLeft', data.startX - PATROL_RANGE);
    enemy.setData('patrolRight', data.startX + PATROL_RANGE);
    
    // 初始速度
    enemy.setVelocityX(PATROL_SPEED * enemy.getData('direction'));
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 560, 'Use Arrow Keys to Move', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });
}

function update() {
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

  // 重置状态计数
  enemyStates.patrolling = 0;
  enemyStates.chasing = 0;

  // 更新每个敌人的行为
  enemies.children.entries.forEach(enemy => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );

    // 判断是否进入追踪范围
    if (distance < DETECTION_RANGE) {
      // 追踪模式
      enemy.setData('state', 'chase');
      enemyStates.chasing++;

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

      // 改变颜色为红色表示追踪
      enemy.setTint(0xff6666);

    } else {
      // 巡逻模式
      enemy.setData('state', 'patrol');
      enemyStates.patrolling++;

      // 恢复黄色
      enemy.clearTint();

      const direction = enemy.getData('direction');
      const patrolLeft = enemy.getData('patrolLeft');
      const patrolRight = enemy.getData('patrolRight');

      // 检查是否到达巡逻边界
      if (enemy.x <= patrolLeft && direction === -1) {
        enemy.setData('direction', 1);
        enemy.setVelocityX(PATROL_SPEED);
        enemy.setVelocityY(0);
      } else if (enemy.x >= patrolRight && direction === 1) {
        enemy.setData('direction', -1);
        enemy.setVelocityX(-PATROL_SPEED);
        enemy.setVelocityY(0);
      } else {
        // 保持当前巡逻方向
        enemy.setVelocityX(PATROL_SPEED * direction);
        enemy.setVelocityY(0);
      }
    }
  });

  // 更新状态显示
  statusText.setText([
    `Enemies Patrolling: ${enemyStates.patrolling}`,
    `Enemies Chasing: ${enemyStates.chasing}`,
    `Player Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  ]);
}

new Phaser.Game(config);
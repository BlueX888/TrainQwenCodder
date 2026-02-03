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
let distanceText;

// 状态信号变量
let caughtCount = 0;
let escapeTime = 0;
let isCaught = false;

const PLAYER_SPEED = 300 * 1.2; // 360
const ENEMY_SPEED = 300;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（白色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffffff, 1);
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
  this.physics.add.overlap(player, enemy, onCatch, null, this);

  // 状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  distanceText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#00ff00'
  });

  // 添加说明文本
  this.add.text(16, 560, '使用方向键移动 | 玩家速度: 360 | 敌人速度: 300', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  // 重置逃脱时间
  escapeTime = 0;
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

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新逃脱时间
  if (!isCaught) {
    escapeTime += delta / 1000;
  }

  // 更新状态显示
  statusText.setText([
    `被抓次数: ${caughtCount}`,
    `状态: ${isCaught ? '被抓住！' : '逃脱中'}`,
    `逃脱时间: ${escapeTime.toFixed(1)}秒`
  ]);

  distanceText.setText(`距离: ${distance.toFixed(0)}px`);

  // 距离过近时变色警告
  if (distance < 100) {
    distanceText.setColor('#ff0000');
  } else if (distance < 200) {
    distanceText.setColor('#ffff00');
  } else {
    distanceText.setColor('#00ff00');
  }
}

function onCatch() {
  if (!isCaught) {
    isCaught = true;
    caughtCount++;
    
    // 玩家变红表示被抓
    player.setTint(0xff0000);
    
    // 1秒后重置
    setTimeout(() => {
      isCaught = false;
      player.clearTint();
      
      // 重新放置敌人到随机位置
      enemy.x = Phaser.Math.Between(50, 750);
      enemy.y = Phaser.Math.Between(50, 550);
      
      // 确保敌人不会太靠近玩家
      while (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 150) {
        enemy.x = Phaser.Math.Between(50, 750);
        enemy.y = Phaser.Math.Between(50, 550);
      }
    }, 1000);
  }
}

new Phaser.Game(config);
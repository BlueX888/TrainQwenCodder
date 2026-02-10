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

// 游戏状态变量（可验证）
let gameState = {
  health: 100,
  score: 0,
  distanceToEnemy: 0
};

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人（在屏幕边缘随机位置）
  const startX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
  const startY = Phaser.Math.Between(100, 500);
  enemy = this.physics.add.sprite(startX, startY, 'enemy');
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, hitEnemy, null, this);
  
  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  distanceText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加说明文本
  this.add.text(16, 560, '使用方向键移动 | 躲避青色敌人追踪', {
    fontSize: '16px',
    fill: '#ffff00'
  });
  
  updateStatusDisplay();
}

function update() {
  // 玩家移动控制（速度 96 = 80 * 1.2）
  const playerSpeed = 96;
  
  player.setVelocity(0);
  
  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
  }
  
  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(playerSpeed);
  }
  
  // 敌人追踪玩家（速度 80）
  if (gameState.health > 0) {
    this.physics.moveToObject(enemy, player, 80);
  } else {
    enemy.setVelocity(0);
  }
  
  // 计算距离
  gameState.distanceToEnemy = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );
  
  // 更新显示
  updateStatusDisplay();
  
  // 游戏结束检测
  if (gameState.health <= 0) {
    statusText.setColor('#ff0000');
    enemy.setTint(0xff0000);
  }
}

function hitEnemy(player, enemy) {
  // 碰撞时减少生命值
  if (gameState.health > 0) {
    gameState.health -= 10;
    
    // 击退效果
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );
    
    // 敌人短暂后退
    enemy.setVelocity(
      Math.cos(angle) * -100,
      Math.sin(angle) * -100
    );
    
    // 闪烁效果
    player.setTint(0xff0000);
    setTimeout(() => {
      if (gameState.health > 0) {
        player.clearTint();
      }
    }, 200);
    
    updateStatusDisplay();
  }
}

function updateStatusDisplay() {
  statusText.setText(
    `生命值: ${gameState.health} | 得分: ${gameState.score}`
  );
  
  distanceText.setText(
    `与敌人距离: ${Math.floor(gameState.distanceToEnemy)}px | ` +
    `玩家速度: 96 | 敌人速度: 80`
  );
}

new Phaser.Game(config);
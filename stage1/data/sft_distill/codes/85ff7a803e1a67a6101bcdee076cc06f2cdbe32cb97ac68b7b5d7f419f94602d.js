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
  collisionCount: 0,
  distance: 0,
  playerSpeed: 288,
  enemySpeed: 240,
  gameTime: 0,
  status: 'running'
};

let player;
let enemy;
let cursors;
let lastCollisionTime = 0;

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
  player.setMaxVelocity(288, 288);

  // 创建敌人
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  const instructionText = this.add.text(10, 10, 
    'Use Arrow Keys to move\nPlayer Speed: 288 | Enemy Speed: 240\nAvoid the cyan enemy!', 
    {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }
  );

  // 显示碰撞计数
  this.collisionText = this.add.text(10, 100, 
    'Collisions: 0', 
    {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );

  // 显示距离
  this.distanceText = this.add.text(10, 130, 
    'Distance: 0', 
    {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );

  console.log(JSON.stringify({
    event: 'game_start',
    playerSpeed: 288,
    enemySpeed: 240,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 更新游戏时间
  window.__signals__.gameTime = time;

  // 玩家移动控制
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-288);
  } else if (cursors.right.isDown) {
    player.setVelocityX(288);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-288);
  } else if (cursors.down.isDown) {
    player.setVelocityY(288);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, 240);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );
  window.__signals__.distance = Math.round(distance);

  // 更新距离显示
  this.distanceText.setText(`Distance: ${Math.round(distance)}px`);

  // 如果距离很近，改变颜色警告
  if (distance < 100) {
    this.distanceText.setStyle({ fill: '#ff0000' });
  } else {
    this.distanceText.setStyle({ fill: '#ffffff' });
  }
}

function handleCollision(player, enemy) {
  const currentTime = Date.now();
  
  // 防止重复计数（500ms 内只计一次）
  if (currentTime - lastCollisionTime > 500) {
    window.__signals__.collisionCount++;
    lastCollisionTime = currentTime;

    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${window.__signals__.collisionCount}`);

    // 输出碰撞日志
    console.log(JSON.stringify({
      event: 'collision',
      collisionCount: window.__signals__.collisionCount,
      playerPosition: { x: Math.round(player.x), y: Math.round(player.y) },
      enemyPosition: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
      timestamp: currentTime
    }));

    // 重置敌人位置到随机边缘位置
    const edge = Phaser.Math.Between(0, 3);
    switch(edge) {
      case 0: // 上边
        enemy.setPosition(Phaser.Math.Between(50, 750), 50);
        break;
      case 1: // 右边
        enemy.setPosition(750, Phaser.Math.Between(50, 550));
        break;
      case 2: // 下边
        enemy.setPosition(Phaser.Math.Between(50, 750), 550);
        break;
      case 3: // 左边
        enemy.setPosition(50, Phaser.Math.Between(50, 550));
        break;
    }

    // 闪烁效果
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });
  }
}

new Phaser.Game(config);
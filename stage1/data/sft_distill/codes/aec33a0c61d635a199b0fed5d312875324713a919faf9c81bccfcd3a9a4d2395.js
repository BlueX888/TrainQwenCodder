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

// 全局状态信号
window.__signals__ = {
  playerSpeed: 96,
  enemySpeed: 80,
  distance: 0,
  collisionCount: 0,
  gameTime: 0,
  playerPosition: { x: 0, y: 0 },
  enemyPosition: { x: 0, y: 0 },
  isColliding: false,
  events: []
};

let player;
let enemy;
let cursors;
let startTime;

function preload() {
  // 不需要加载外部资源
}

function create() {
  startTime = this.time.now;
  
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('playerTexture', 32, 32);
  playerGraphics.destroy();
  
  // 创建敌人纹理（紫色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x9900ff, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemyTexture', 40, 40);
  enemyGraphics.destroy();
  
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerTexture');
  player.setCollideWorldBounds(true);
  
  // 创建敌人精灵
  enemy = this.physics.add.sprite(100, 100, 'enemyTexture');
  enemy.setCollideWorldBounds(true);
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 控制
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);
  
  // 添加文本显示
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  console.log('Game initialized:', JSON.stringify({
    playerSpeed: 96,
    enemySpeed: 80,
    playerStart: { x: 400, y: 300 },
    enemyStart: { x: 100, y: 100 }
  }));
}

function handleCollision() {
  if (!window.__signals__.isColliding) {
    window.__signals__.isColliding = true;
    window.__signals__.collisionCount++;
    
    const event = {
      type: 'collision',
      time: window.__signals__.gameTime,
      position: { x: player.x, y: player.y }
    };
    
    window.__signals__.events.push(event);
    console.log('Collision detected:', JSON.stringify(event));
  }
}

function update(time, delta) {
  // 更新游戏时间
  window.__signals__.gameTime = ((time - startTime) / 1000).toFixed(2);
  
  // 重置玩家速度
  player.setVelocity(0);
  
  const playerSpeed = 96; // 80 * 1.2
  
  // 玩家移动控制
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(playerSpeed);
  }
  
  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(playerSpeed);
  }
  
  // 对角线移动速度归一化
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(playerSpeed);
  }
  
  // 敌人追踪玩家
  const enemySpeed = 80;
  this.physics.moveToObject(enemy, player, enemySpeed);
  
  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );
  
  // 更新状态信号
  window.__signals__.distance = distance.toFixed(2);
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };
  window.__signals__.enemyPosition = {
    x: Math.round(enemy.x),
    y: Math.round(enemy.y)
  };
  
  // 检查是否还在碰撞
  const isOverlapping = this.physics.overlap(player, enemy);
  if (!isOverlapping) {
    window.__signals__.isColliding = false;
  }
  
  // 更新显示文本
  this.statusText.setText([
    `Time: ${window.__signals__.gameTime}s`,
    `Distance: ${window.__signals__.distance}`,
    `Collisions: ${window.__signals__.collisionCount}`,
    `Player: (${window.__signals__.playerPosition.x}, ${window.__signals__.playerPosition.y})`,
    `Enemy: (${window.__signals__.enemyPosition.x}, ${window.__signals__.enemyPosition.y})`,
    `Player Speed: ${playerSpeed} | Enemy Speed: ${enemySpeed}`,
    `Use Arrow Keys or WASD to move`
  ]);
  
  // 每秒输出一次状态日志
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    console.log('Status:', JSON.stringify({
      time: window.__signals__.gameTime,
      distance: window.__signals__.distance,
      collisions: window.__signals__.collisionCount,
      playerPos: window.__signals__.playerPosition,
      enemyPos: window.__signals__.enemyPosition
    }));
  }
}

const game = new Phaser.Game(config);
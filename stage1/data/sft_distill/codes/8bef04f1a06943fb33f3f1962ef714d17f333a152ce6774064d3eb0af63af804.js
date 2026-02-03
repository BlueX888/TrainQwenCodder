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
let gameOver = false;
let survivalTime = 0;
let timeText;
let gameOverText;

function preload() {
  // 创建玩家纹理（蓝色圆形）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(12, 12, 12);
  enemyGraphics.generateTexture('enemy', 24, 24);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.8);
  player.setMaxVelocity(250);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 生成15个敌人，随机分布在场景边缘
  for (let i = 0; i < 15; i++) {
    let x, y;
    const side = Phaser.Math.Between(0, 3);
    
    // 根据边缘位置生成敌人
    switch(side) {
      case 0: // 上边
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(20, 50);
        break;
      case 1: // 右边
        x = Phaser.Math.Between(750, 780);
        y = Phaser.Math.Between(50, 550);
        break;
      case 2: // 下边
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(550, 580);
        break;
      case 3: // 左边
        x = Phaser.Math.Between(20, 50);
        y = Phaser.Math.Between(50, 550);
        break;
    }
    
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.5);
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示存活时间
  timeText = this.add.text(16, 16, 'Survival Time: 0s', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文字
  this.add.text(16, 50, 'Use Arrow Keys to Move\nAvoid the Red Enemies!', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 显示敌人数量
  this.add.text(16, 110, 'Enemies: 15', {
    fontSize: '16px',
    fill: '#ff0000',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  survivalTime += delta;
  timeText.setText('Survival Time: ' + (survivalTime / 1000).toFixed(1) + 's');

  // 玩家移动控制
  const acceleration = 400;
  
  if (cursors.left.isDown) {
    player.setAccelerationX(-acceleration);
  } else if (cursors.right.isDown) {
    player.setAccelerationX(acceleration);
  } else {
    player.setAccelerationX(0);
  }

  if (cursors.up.isDown) {
    player.setAccelerationY(-acceleration);
  } else if (cursors.down.isDown) {
    player.setAccelerationY(acceleration);
  } else {
    player.setAccelerationY(0);
  }

  // 让每个敌人追踪玩家
  enemies.children.entries.forEach(enemy => {
    this.physics.moveToObject(enemy, player, 120);
  });
}

function hitEnemy(player, enemy) {
  if (gameOver) {
    return;
  }

  gameOver = true;

  // 停止所有物理运动
  this.physics.pause();

  // 玩家变红表示被击中
  player.setTint(0xff0000);

  // 显示游戏结束文字
  gameOverText = this.add.text(400, 300, 'GAME OVER!\n\nSurvived: ' + (survivalTime / 1000).toFixed(1) + 's\n\nClick to Restart', {
    fontSize: '32px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 },
    align: 'center'
  });
  gameOverText.setOrigin(0.5);

  // 点击重启游戏
  this.input.once('pointerdown', () => {
    gameOver = false;
    survivalTime = 0;
    this.scene.restart();
  });
}

const game = new Phaser.Game(config);
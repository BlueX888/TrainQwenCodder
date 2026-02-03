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

// 游戏状态变量
let player;
let items;
let cursors;
let timeText;
let scoreText;
let resultText;
let timerEvent;
let gameOver = false;
let totalItems = 8;
let collectedItems = 0;
let timeRemaining = 12;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建物品纹理
  const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  itemGraphics.fillStyle(0xffff00, 1);
  itemGraphics.fillCircle(12, 12, 12);
  itemGraphics.generateTexture('item', 24, 24);
  itemGraphics.destroy();
}

function create() {
  // 初始化游戏状态
  gameOver = false;
  collectedItems = 0;
  timeRemaining = 12;

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建物品组
  items = this.physics.add.group();
  
  // 随机生成物品位置
  const positions = generateItemPositions(totalItems);
  positions.forEach(pos => {
    const item = items.create(pos.x, pos.y, 'item');
    item.setCircle(12);
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, items, collectItem, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建UI文本
  timeText = this.add.text(16, 16, 'Time: 12s', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  scoreText = this.add.text(16, 50, `Items: 0/${totalItems}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  resultText = this.add.text(400, 300, '', {
    fontSize: '48px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  resultText.setOrigin(0.5);
  resultText.setVisible(false);

  // 创建倒计时器
  timerEvent = this.time.addEvent({
    delay: 1000,
    callback: updateTimer,
    callbackScope: this,
    loop: true
  });

  // 添加游戏说明
  this.add.text(400, 560, 'Use Arrow Keys to Move - Collect all items before time runs out!', {
    fontSize: '16px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update() {
  if (gameOver) {
    player.setVelocity(0, 0);
    return;
  }

  // 玩家移动控制
  player.setVelocity(0, 0);

  if (cursors.left.isDown) {
    player.setVelocityX(-240);
  } else if (cursors.right.isDown) {
    player.setVelocityX(240);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-240);
  } else if (cursors.down.isDown) {
    player.setVelocityY(240);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.setVelocity(
      player.body.velocity.x * 0.707,
      player.body.velocity.y * 0.707
    );
  }
}

function collectItem(player, item) {
  // 移除物品
  item.destroy();
  
  // 更新收集计数
  collectedItems++;
  scoreText.setText(`Items: ${collectedItems}/${totalItems}`);

  // 检查胜利条件
  if (collectedItems >= totalItems) {
    endGame(true);
  }
}

function updateTimer() {
  if (gameOver) return;

  timeRemaining--;
  timeText.setText(`Time: ${timeRemaining}s`);

  // 时间警告效果
  if (timeRemaining <= 3) {
    timeText.setColor('#ff0000');
  } else if (timeRemaining <= 6) {
    timeText.setColor('#ffaa00');
  }

  // 检查失败条件
  if (timeRemaining <= 0) {
    endGame(false);
  }
}

function endGame(success) {
  gameOver = true;
  
  // 停止计时器
  if (timerEvent) {
    timerEvent.remove();
  }

  // 显示结果
  if (success) {
    resultText.setText('SUCCESS!');
    resultText.setColor('#00ff00');
  } else {
    resultText.setText('TIME UP - FAILED!');
    resultText.setColor('#ff0000');
  }
  resultText.setVisible(true);

  // 输出验证状态
  console.log('Game Over:', {
    success: success,
    collectedItems: collectedItems,
    totalItems: totalItems,
    timeRemaining: timeRemaining
  });
}

function generateItemPositions(count) {
  const positions = [];
  const margin = 50;
  const minDistance = 80;

  for (let i = 0; i < count; i++) {
    let validPosition = false;
    let attempts = 0;
    let x, y;

    while (!validPosition && attempts < 100) {
      x = Phaser.Math.Between(margin, 800 - margin);
      y = Phaser.Math.Between(margin, 600 - margin);

      // 检查与玩家起始位置的距离
      const distanceToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
      if (distanceToPlayer < 100) {
        attempts++;
        continue;
      }

      // 检查与其他物品的距离
      validPosition = true;
      for (let pos of positions) {
        const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
        if (distance < minDistance) {
          validPosition = false;
          break;
        }
      }

      attempts++;
    }

    positions.push({ x, y });
  }

  return positions;
}

// 启动游戏
new Phaser.Game(config);
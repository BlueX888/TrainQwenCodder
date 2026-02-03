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
let collectibles;
let cursors;
let scoreText;
let score = 0;

function preload() {
  // 生成玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 生成可收集物体纹理（红色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xff0000, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建可收集物体组
  collectibles = this.physics.add.group();

  // 在随机位置生成12个可收集物体
  const positions = [];
  for (let i = 0; i < 12; i++) {
    let x, y;
    let validPosition = false;
    
    // 确保物体不会太靠近玩家初始位置
    while (!validPosition) {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
      
      const distance = Phaser.Math.Distance.Between(x, y, 400, 300);
      if (distance > 100) {
        validPosition = true;
      }
    }
    
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCircle(15); // 设置圆形碰撞体
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建分数文本
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
  });
  scoreText.setDepth(1);
}

function update() {
  // 玩家移动控制
  const speed = 200;

  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  } else {
    player.setVelocityY(0);
  }
}

function collectItem(player, collectible) {
  // 销毁可收集物体
  collectible.destroy();

  // 增加分数
  score += 10;

  // 更新分数显示
  scoreText.setText('Score: ' + score);

  // 检查是否收集完所有物体
  if (collectibles.countActive(true) === 0) {
    scoreText.setText('Score: ' + score + ' - YOU WIN!');
    scoreText.setStyle({ fill: '#00ff00' });
  }
}

// 启动游戏
const game = new Phaser.Game(config);
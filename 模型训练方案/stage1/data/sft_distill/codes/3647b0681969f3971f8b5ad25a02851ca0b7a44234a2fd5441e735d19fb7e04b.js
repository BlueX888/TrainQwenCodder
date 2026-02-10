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
let collectedCount = 0;
let totalCollectibles = 5;
let winText;
let scoreText;

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建收集物纹理（黄色圆形）
  const collectibleGraphics = this.add.graphics();
  collectibleGraphics.fillStyle(0xffff00, 1);
  collectibleGraphics.fillCircle(15, 15, 15);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setScale(1);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 随机生成5个收集物
  for (let i = 0; i < totalCollectibles; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCollideWorldBounds(true);
    
    // 添加轻微的随机移动效果
    collectible.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    collectible.setBounce(1, 1);
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, '已收集: 0 / 5', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建通关文本（初始隐藏）
  winText = this.add.text(400, 300, '恭喜通关！', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  winText.setOrigin(0.5);
  winText.setVisible(false);

  // 添加游戏说明
  this.add.text(16, 50, '使用方向键移动，收集所有黄色圆圈', {
    fontSize: '16px',
    fill: '#cccccc',
    fontFamily: 'Arial'
  });
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
  // 销毁收集物
  collectible.destroy();
  
  // 增加收集计数
  collectedCount++;
  
  // 更新分数文本
  scoreText.setText('已收集: ' + collectedCount + ' / ' + totalCollectibles);
  
  // 检查是否收集完成
  if (collectedCount >= totalCollectibles) {
    // 显示通关文本
    winText.setVisible(true);
    
    // 停止玩家移动
    player.setVelocity(0, 0);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: winText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // 可选：3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
      collectedCount = 0;
    });
  }
}

// 启动游戏
const game = new Phaser.Game(config);
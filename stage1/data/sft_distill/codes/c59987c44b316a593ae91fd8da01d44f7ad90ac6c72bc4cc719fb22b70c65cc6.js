const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

let player;
let collectibles;
let cursors;
let scoreText;
let winText;
let collectedCount = 0; // 可验证的状态信号
const TOTAL_COLLECTIBLES = 10;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建收集品纹理
  const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  collectibleGraphics.fillStyle(0xffff00, 1);
  collectibleGraphics.fillRect(0, 0, 30, 30);
  collectibleGraphics.generateTexture('collectible', 30, 30);
  collectibleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocityDrag(500);
  player.setMaxVelocity(300);

  // 创建收集品组
  collectibles = this.physics.add.group();

  // 随机生成10个收集品
  for (let i = 0; i < TOTAL_COLLECTIBLES; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const collectible = collectibles.create(x, y, 'collectible');
    collectible.setCollideWorldBounds(true);
    
    // 添加轻微的浮动效果
    this.tweens.add({
      targets: collectible,
      y: collectible.y + 10,
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, collectibles, collectItem, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, '已收集: 0 / ' + TOTAL_COLLECTIBLES, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建通关文本（初始隐藏）
  winText = this.add.text(400, 300, '恭喜通关！', {
    fontSize: '64px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 6
  });
  winText.setOrigin(0.5);
  winText.setVisible(false);
}

function update() {
  // 玩家移动控制
  const speed = 300;

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
  // 移除收集品
  collectible.destroy();
  
  // 更新收集计数
  collectedCount++;
  scoreText.setText('已收集: ' + collectedCount + ' / ' + TOTAL_COLLECTIBLES);

  // 添加收集音效（使用视觉反馈代替）
  const flash = this.add.graphics();
  flash.fillStyle(0xffff00, 0.5);
  flash.fillCircle(collectible.x, collectible.y, 40);
  this.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 2,
    duration: 300,
    onComplete: () => flash.destroy()
  });

  // 检查是否通关
  if (collectedCount >= TOTAL_COLLECTIBLES) {
    winText.setVisible(true);
    
    // 停止玩家移动
    player.setVelocity(0, 0);
    cursors.left.enabled = false;
    cursors.right.enabled = false;
    cursors.up.enabled = false;
    cursors.down.enabled = false;

    // 添加通关动画
    this.tweens.add({
      targets: winText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

// 启动游戏
new Phaser.Game(config);
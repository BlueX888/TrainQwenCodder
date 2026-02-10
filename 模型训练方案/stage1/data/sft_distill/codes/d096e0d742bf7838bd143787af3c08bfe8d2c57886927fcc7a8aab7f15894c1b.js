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
let diamonds;
let cursors;
let collectedCount = 0;
let totalDiamonds = 5;
let winText;
let scoreText;

function preload() {
  // 创建玩家纹理（圆形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(20, 20, 20);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建菱形纹理
  const diamondGraphics = this.add.graphics();
  diamondGraphics.fillStyle(0xffff00, 1);
  diamondGraphics.beginPath();
  diamondGraphics.moveTo(15, 0);
  diamondGraphics.lineTo(30, 15);
  diamondGraphics.lineTo(15, 30);
  diamondGraphics.lineTo(0, 15);
  diamondGraphics.closePath();
  diamondGraphics.fillPath();
  diamondGraphics.generateTexture('diamond', 30, 30);
  diamondGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDrag(300);
  player.setMaxVelocity(300);

  // 创建菱形组
  diamonds = this.physics.add.group();

  // 随机生成5个菱形
  for (let i = 0; i < totalDiamonds; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const diamond = diamonds.create(x, y, 'diamond');
    diamond.setCollideWorldBounds(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: diamond,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, diamonds, collectDiamond, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, '收集进度: 0/5', {
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

function collectDiamond(player, diamond) {
  // 移除被收集的菱形
  diamond.destroy();
  
  // 增加收集计数
  collectedCount++;
  
  // 更新分数文本
  scoreText.setText('收集进度: ' + collectedCount + '/' + totalDiamonds);
  
  // 播放收集音效（使用缩放动画模拟）
  this.tweens.add({
    targets: player,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true
  });
  
  // 检查是否收集完成
  if (collectedCount >= totalDiamonds) {
    winText.setVisible(true);
    
    // 停止玩家移动
    player.setVelocity(0, 0);
    
    // 禁用键盘输入
    cursors.left.enabled = false;
    cursors.right.enabled = false;
    cursors.up.enabled = false;
    cursors.down.enabled = false;
    
    // 通关文字动画
    this.tweens.add({
      targets: winText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

// 启动游戏
new Phaser.Game(config);
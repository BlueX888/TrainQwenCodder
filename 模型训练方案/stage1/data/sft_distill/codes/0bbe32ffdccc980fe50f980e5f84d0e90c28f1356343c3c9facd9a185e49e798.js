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
let winText;
let collectedCount = 0;
const TOTAL_COLLECTIBLES = 10;

function preload() {
  // 创建玩家纹理（蓝色圆形）
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();

  // 创建收集物纹理（黄色矩形）
  const collectGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  collectGraphics.fillStyle(0xffeb3b, 1);
  collectGraphics.fillRect(0, 0, 30, 30);
  collectGraphics.generateTexture('collectible', 30, 30);
  collectGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setVelocityMax(200);
  player.setDrag(500);

  // 创建收集物组
  collectibles = this.physics.add.group();

  // 随机生成 10 个收集物
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
  scoreText = this.add.text(16, 16, `收集进度: ${collectedCount}/${TOTAL_COLLECTIBLES}`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  scoreText.setDepth(10);

  // 创建通关文本（初始隐藏）
  winText = this.add.text(400, 300, '🎉 恭喜通关！🎉', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffeb3b',
    stroke: '#000000',
    strokeThickness: 6
  });
  winText.setOrigin(0.5);
  winText.setVisible(false);
  winText.setDepth(20);

  // 添加操作提示
  this.add.text(16, 560, '使用方向键移动', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
}

function update() {
  // 玩家移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
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
  scoreText.setText(`收集进度: ${collectedCount}/${TOTAL_COLLECTIBLES}`);
  
  // 播放收集音效（使用屏幕闪烁代替）
  this.cameras.main.flash(100, 255, 235, 59, false);
  
  // 检查是否通关
  if (collectedCount >= TOTAL_COLLECTIBLES) {
    winGame.call(this);
  }
}

function winGame() {
  // 显示通关文本
  winText.setVisible(true);
  
  // 添加通关动画
  this.tweens.add({
    targets: winText,
    scale: { from: 0.5, to: 1.2 },
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 停止玩家移动
  player.setVelocity(0, 0);
  
  // 禁用键盘控制
  cursors.left.enabled = false;
  cursors.right.enabled = false;
  cursors.up.enabled = false;
  cursors.down.enabled = false;
  
  // 添加庆祝粒子效果（使用简单的图形模拟）
  for (let i = 0; i < 50; i++) {
    const particle = this.add.graphics();
    const color = Phaser.Display.Color.RandomRGB();
    particle.fillStyle(color.color, 1);
    particle.fillCircle(0, 0, 5);
    particle.setPosition(400, 300);
    
    this.tweens.add({
      targets: particle,
      x: Phaser.Math.Between(100, 700),
      y: Phaser.Math.Between(100, 500),
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => particle.destroy()
    });
  }
}

// 启动游戏
new Phaser.Game(config);
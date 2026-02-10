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
let stars;
let cursors;
let collectedCount = 0;
let totalStars = 5;
let winText;
let gameOver = false;
let scoreText;

function preload() {
  // 创建星形纹理
  createStarTexture(this);
  // 创建玩家纹理
  createPlayerTexture(this);
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setScale(1);

  // 创建星形组
  stars = this.physics.add.group();
  
  // 随机生成5个星形
  for (let i = 0; i < totalStars; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const star = stars.create(x, y, 'star');
    star.setScale(0.8);
    // 添加轻微的旋转动画
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, stars, collectStar, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示收集进度
  scoreText = this.add.text(16, 16, `已收集: ${collectedCount}/${totalStars}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建胜利文本（初始隐藏）
  winText = this.add.text(400, 300, '恭喜通关!', {
    fontSize: '64px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 6
  });
  winText.setOrigin(0.5);
  winText.setVisible(false);
}

function update() {
  if (gameOver) {
    return;
  }

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

function collectStar(player, star) {
  // 销毁星形
  star.destroy();
  
  // 增加收集计数
  collectedCount++;
  
  // 更新分数显示
  scoreText.setText(`已收集: ${collectedCount}/${totalStars}`);
  
  // 检查是否收集完所有星形
  if (collectedCount >= totalStars) {
    gameOver = true;
    winText.setVisible(true);
    player.setVelocity(0, 0);
    
    // 添加胜利文本缩放动画
    this.tweens.add({
      targets: winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

// 创建星形纹理
function createStarTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 绘制五角星
  const points = [];
  const outerRadius = 25;
  const innerRadius = 10;
  
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    points.push({
      x: 25 + Math.cos(angle) * outerRadius,
      y: 25 + Math.sin(angle) * outerRadius
    });
    
    const innerAngle = (i * 72 - 90 + 36) * Math.PI / 180;
    points.push({
      x: 25 + Math.cos(innerAngle) * innerRadius,
      y: 25 + Math.sin(innerAngle) * innerRadius
    });
  }
  
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
}

// 创建玩家纹理
function createPlayerTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 绘制圆形玩家
  graphics.fillStyle(0x00aaff, 1);
  graphics.lineStyle(3, 0x0066cc, 1);
  graphics.fillCircle(20, 20, 18);
  graphics.strokeCircle(20, 20, 18);
  
  // 添加眼睛
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(14, 16, 4);
  graphics.fillCircle(26, 16, 4);
  
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(14, 16, 2);
  graphics.fillCircle(26, 16, 2);
  
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();
}

new Phaser.Game(config);
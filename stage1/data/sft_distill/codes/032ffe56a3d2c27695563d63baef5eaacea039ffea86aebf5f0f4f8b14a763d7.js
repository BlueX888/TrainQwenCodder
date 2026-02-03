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
let triangles;
let cursors;
let scoreText;
let score = 0;
let totalTriangles = 20;
let winText;

function preload() {
  // 创建玩家纹理（圆形）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(16, 16, 16);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建三角形纹理
  const triangleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  triangleGraphics.fillStyle(0xffff00, 1);
  triangleGraphics.beginPath();
  triangleGraphics.moveTo(15, 5);
  triangleGraphics.lineTo(25, 25);
  triangleGraphics.lineTo(5, 25);
  triangleGraphics.closePath();
  triangleGraphics.fillPath();
  triangleGraphics.generateTexture('triangle', 30, 30);
  triangleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.95);

  // 创建三角形物理组
  triangles = this.physics.add.group();

  // 随机生成20个三角形
  for (let i = 0; i < totalTriangles; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const triangle = triangles.create(x, y, 'triangle');
    triangle.setScale(0.8);
    
    // 确保三角形不会与玩家初始位置重叠
    if (Phaser.Math.Distance.Between(x, y, 400, 300) < 80) {
      triangle.x = Phaser.Math.Between(50, 300);
      triangle.y = Phaser.Math.Between(50, 200);
    }
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, triangles, collectTriangle, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示分数
  scoreText = this.add.text(16, 16, '收集: 0 / ' + totalTriangles, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建通关文字（初始隐藏）
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
  // 只有在未通关时才允许移动
  if (score < totalTriangles) {
    const speed = 300;

    // 重置速度
    player.setVelocity(0);

    // 键盘控制
    if (cursors.left.isDown) {
      player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(speed);
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      player.setVelocityY(speed);
    }
  } else {
    // 通关后停止玩家移动
    player.setVelocity(0);
  }
}

function collectTriangle(player, triangle) {
  // 销毁三角形
  triangle.destroy();
  
  // 增加分数
  score++;
  
  // 更新分数显示
  scoreText.setText('收集: ' + score + ' / ' + totalTriangles);
  
  // 检查是否通关
  if (score >= totalTriangles) {
    winText.setVisible(true);
    
    // 添加通关动画效果
    this.tweens.add({
      targets: winText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

// 启动游戏
const game = new Phaser.Game(config);
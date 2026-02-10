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
let winText;
let score = 0;
const TOTAL_TRIANGLES = 20;

function preload() {
  // 创建玩家纹理（圆形）
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

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
  player.setDrag(0.8);
  player.setMaxVelocity(300);

  // 创建三角形组
  triangles = this.physics.add.group();

  // 随机生成20个三角形
  for (let i = 0; i < TOTAL_TRIANGLES; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const triangle = triangles.create(x, y, 'triangle');
    triangle.setCircle(10); // 设置碰撞体为圆形，更精确
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, triangles, collectTriangle, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, '收集: 0 / ' + TOTAL_TRIANGLES, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建通关文本（初始隐藏）
  winText = this.add.text(400, 300, '恭喜通关！', {
    fontSize: '48px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 6
  });
  winText.setOrigin(0.5);
  winText.setVisible(false);

  // 添加提示文本
  this.add.text(16, 50, '使用方向键移动', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });
}

function update() {
  // 玩家移动控制
  const speed = 300;

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
}

function collectTriangle(player, triangle) {
  // 销毁三角形
  triangle.destroy();

  // 增加分数
  score++;

  // 更新分数文本
  scoreText.setText('收集: ' + score + ' / ' + TOTAL_TRIANGLES);

  // 检查是否通关
  if (score >= TOTAL_TRIANGLES) {
    winText.setVisible(true);
    // 停止玩家移动
    player.setVelocity(0, 0);
    cursors = null;
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);
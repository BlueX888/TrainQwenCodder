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
let collectedCount = 0;
let totalTriangles = 3;
let winText;
let scoreText;

// 初始化 signals 对象
window.__signals__ = {
  collected: 0,
  totalTriangles: 3,
  gameWon: false,
  playerPosition: { x: 0, y: 0 }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（圆形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(20, 20, 20);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建三角形纹理
  const triangleGraphics = this.add.graphics();
  triangleGraphics.fillStyle(0xffff00, 1);
  triangleGraphics.beginPath();
  triangleGraphics.moveTo(15, 5);
  triangleGraphics.lineTo(25, 25);
  triangleGraphics.lineTo(5, 25);
  triangleGraphics.closePath();
  triangleGraphics.fillPath();
  triangleGraphics.generateTexture('triangle', 30, 30);
  triangleGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setScale(1);

  // 创建三角形组
  triangles = this.physics.add.group();

  // 随机生成3个三角形
  for (let i = 0; i < totalTriangles; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const triangle = triangles.create(x, y, 'triangle');
    triangle.setScale(1.5);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: triangle,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  // 添加碰撞检测
  this.physics.add.overlap(player, triangles, collectTriangle, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, '已收集: 0 / 3', {
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

  console.log(JSON.stringify({
    event: 'game_start',
    totalTriangles: totalTriangles,
    playerPosition: { x: player.x, y: player.y }
  }));
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

  // 更新 signals
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };
}

function collectTriangle(player, triangle) {
  // 销毁三角形
  triangle.destroy();
  
  // 增加收集计数
  collectedCount++;
  
  // 更新分数文本
  scoreText.setText(`已收集: ${collectedCount} / ${totalTriangles}`);

  // 更新 signals
  window.__signals__.collected = collectedCount;

  console.log(JSON.stringify({
    event: 'triangle_collected',
    collected: collectedCount,
    remaining: totalTriangles - collectedCount
  }));

  // 检查是否收集完成
  if (collectedCount >= totalTriangles) {
    winText.setVisible(true);
    window.__signals__.gameWon = true;
    
    console.log(JSON.stringify({
      event: 'game_won',
      collected: collectedCount,
      totalTriangles: totalTriangles
    }));

    // 添加胜利动画
    this.tweens.add({
      targets: winText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

const game = new Phaser.Game(config);
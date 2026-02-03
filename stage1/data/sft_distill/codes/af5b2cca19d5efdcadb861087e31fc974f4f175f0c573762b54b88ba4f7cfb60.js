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

// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  collected: 0,
  totalTriangles: 3,
  gameComplete: false,
  events: []
};

let player;
let triangles;
let cursors;
let collectedCount = 0;
let totalTriangles = 3;
let victoryText;
let scoreText;

function preload() {
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
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDrag(300);

  // 创建三角形收集物组
  triangles = this.physics.add.group();

  // 随机生成3个三角形
  for (let i = 0; i < totalTriangles; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const triangle = triangles.create(x, y, 'triangle');
    triangle.setCollideWorldBounds(true);
    
    // 添加轻微的浮动效果
    this.tweens.add({
      targets: triangle,
      y: triangle.y + 10,
      duration: 1000 + i * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, triangles, collectTriangle, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, `收集进度: ${collectedCount}/${totalTriangles}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建胜利文本（初始隐藏）
  victoryText = this.add.text(400, 300, '恭喜通关', {
    fontSize: '64px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 6
  });
  victoryText.setOrigin(0.5);
  victoryText.setVisible(false);

  // 添加操作提示
  this.add.text(16, 560, '使用方向键移动收集三角形', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });

  // 记录游戏开始事件
  window.__signals__.events.push({
    type: 'game_start',
    timestamp: Date.now()
  });

  console.log(JSON.stringify({
    event: 'game_start',
    totalTriangles: totalTriangles
  }));
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

function collectTriangle(player, triangle) {
  // 移除三角形
  triangle.destroy();
  
  // 增加收集计数
  collectedCount++;
  
  // 更新全局信号
  window.__signals__.collected = collectedCount;
  window.__signals__.events.push({
    type: 'triangle_collected',
    count: collectedCount,
    timestamp: Date.now()
  });

  // 更新分数文本
  scoreText.setText(`收集进度: ${collectedCount}/${totalTriangles}`);

  // 输出日志
  console.log(JSON.stringify({
    event: 'triangle_collected',
    collected: collectedCount,
    remaining: totalTriangles - collectedCount
  }));

  // 检查是否收集完所有三角形
  if (collectedCount >= totalTriangles) {
    gameComplete(this);
  }
}

function gameComplete(scene) {
  // 显示胜利文本
  victoryText.setVisible(true);
  
  // 添加胜利文本动画
  scene.tweens.add({
    targets: victoryText,
    scale: 1.2,
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // 更新全局信号
  window.__signals__.gameComplete = true;
  window.__signals__.events.push({
    type: 'game_complete',
    timestamp: Date.now()
  });

  // 输出完成日志
  console.log(JSON.stringify({
    event: 'game_complete',
    collected: collectedCount,
    totalTriangles: totalTriangles,
    success: true
  }));

  // 停止玩家移动
  player.setVelocity(0, 0);
}

new Phaser.Game(config);
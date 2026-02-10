// 完整的 Phaser3 收集游戏代码
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
let victoryText;
let collectedCount = 0;
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

  // 创建三角形物理组
  triangles = this.physics.add.group();

  // 随机生成20个三角形
  for (let i = 0; i < TOTAL_TRIANGLES; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const triangle = triangles.create(x, y, 'triangle');
    triangle.setScale(1);
    
    // 添加轻微的旋转动画效果
    this.tweens.add({
      targets: triangle,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  // 设置碰撞检测
  this.physics.add.overlap(player, triangles, collectTriangle, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建分数文本
  scoreText = this.add.text(16, 16, `收集进度: ${collectedCount}/${TOTAL_TRIANGLES}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 创建胜利文本（初始隐藏）
  victoryText = this.add.text(400, 300, '恭喜通关！', {
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
  // 移除被收集的三角形
  triangle.destroy();
  
  // 增加收集计数
  collectedCount++;
  
  // 更新分数文本
  scoreText.setText(`收集进度: ${collectedCount}/${TOTAL_TRIANGLES}`);
  
  // 播放收集音效（使用简单的缩放动画代替）
  this.tweens.add({
    targets: player,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
  
  // 检查是否收集完成
  if (collectedCount >= TOTAL_TRIANGLES) {
    victoryText.setVisible(true);
    
    // 添加胜利文本动画
    this.tweens.add({
      targets: victoryText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 停止玩家移动
    player.setVelocity(0, 0);
    cursors = null;
  }
}

// 启动游戏
const game = new Phaser.Game(config);
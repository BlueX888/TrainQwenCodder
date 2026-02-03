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
let cursors;
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建橙色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制星形（5个顶点）
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.lineStyle(2, 0xFF8C00, 1); // 深橙色边框
  
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 28;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建玩家精灵（在画布中心）
  player = this.physics.add.sprite(400, 300, 'star');
  
  // 设置世界边界碰撞
  player.setCollideWorldBounds(true);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 检查方向键并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(SPEED);
  }
  
  // 如果同时按下两个方向键，归一化速度以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);
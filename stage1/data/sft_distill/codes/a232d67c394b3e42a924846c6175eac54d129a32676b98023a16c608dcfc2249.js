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

let star;
let cursors;
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制星形（5个点）
  const centerX = 25;
  const centerY = 25;
  const outerRadius = 25;
  const innerRadius = 10;
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
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
  
  // 创建带物理的星形精灵
  star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置碰撞世界边界
  star.setCollideWorldBounds(true);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update() {
  // 重置速度
  star.setVelocity(0, 0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    star.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    star.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    star.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    star.setVelocityY(SPEED);
  }
  
  // 如果同时按下两个方向键，需要归一化速度以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    const velocity = star.body.velocity;
    velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);
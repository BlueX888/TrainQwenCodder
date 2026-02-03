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
const SPEED = 160;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制五角星
  const points = [];
  const outerRadius = 20;
  const innerRadius = 8;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 25 + Math.cos(angle) * radius;
    const y = 25 + Math.sin(angle) * radius;
    points.push(x, y);
  }
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('star', 50, 50);
  graphics.destroy();
  
  // 创建带物理属性的星形精灵
  star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置碰撞边界，使星形不能移出画布
  star.setCollideWorldBounds(true);
  
  // 设置物理世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  star.setVelocity(0, 0);
  
  // 检测方向键并设置速度
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
    const velocityX = star.body.velocity.x;
    const velocityY = star.body.velocity.y;
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    if (magnitude > 0) {
      star.setVelocity(
        (velocityX / magnitude) * SPEED,
        (velocityY / magnitude) * SPEED
      );
    }
  }
}

new Phaser.Game(config);
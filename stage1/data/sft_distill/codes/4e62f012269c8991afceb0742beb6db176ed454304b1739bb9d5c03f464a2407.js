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
const SPEED = 360;

function preload() {
  // 使用 Graphics 创建蓝色六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexRadius = 30;
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  graphics.fillStyle(0x0088ff, 1);
  graphics.beginPath();
  
  // 六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
}

function create() {
  // 设置物理世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建玩家精灵（蓝色六边形）
  player = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置精灵与世界边界碰撞
  player.setCollideWorldBounds(true);
  
  // 初始化方向键
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 根据方向键设置速度
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
  
  // 对角线移动时归一化速度，保持恒定速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.setVelocity(
      player.body.velocity.x * Math.SQRT1_2,
      player.body.velocity.y * Math.SQRT1_2
    );
  }
}

new Phaser.Game(config);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0088ff, 1);
  
  // 绘制六边形
  const hexRadius = 30;
  const hexPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPath.push(x, y);
  }
  
  graphics.fillPoints(hexPath, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置碰撞边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-360);
  } else if (cursors.right.isDown) {
    player.setVelocityX(360);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-360);
  } else if (cursors.down.isDown) {
    player.setVelocityY(360);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    const velocityX = player.body.velocity.x;
    const velocityY = player.body.velocity.y;
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    if (magnitude > 0) {
      player.setVelocity(
        (velocityX / magnitude) * 360,
        (velocityY / magnitude) * 360
      );
    }
  }
}

new Phaser.Game(config);
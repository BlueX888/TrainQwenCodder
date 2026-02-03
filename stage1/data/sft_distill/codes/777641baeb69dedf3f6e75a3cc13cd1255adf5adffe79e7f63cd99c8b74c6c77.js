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

let star;

function preload() {
  // 创建红色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillStar(32, 32, 5, 16, 32, 0);
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（120像素/秒，角度约45度）
  const speed = 120;
  const angle = Math.PI / 4; // 45度
  star.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置与世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置完全弹性碰撞（反弹系数为1）
  star.setBounce(1, 1);
  
  // 禁用摩擦力，保持速度恒定
  star.setDamping(false);
}

function update(time, delta) {
  // 确保速度保持恒定为120
  const currentSpeed = Math.sqrt(
    star.body.velocity.x * star.body.velocity.x +
    star.body.velocity.y * star.body.velocity.y
  );
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - 120) > 0.1) {
    // 归一化速度向量并乘以目标速度
    star.setVelocity(
      (star.body.velocity.x / currentSpeed) * 120,
      (star.body.velocity.y / currentSpeed) * 120
    );
  }
}

new Phaser.Game(config);
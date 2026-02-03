const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力，保持匀速运动
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 使用 Graphics 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);  // 青色
  graphics.fillCircle(25, 25, 25);  // 半径25的圆形
  graphics.generateTexture('cyanCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'cyanCircle');
  
  // 设置初始速度（随机方向，速度大小为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  circle.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
  
  // 可选：添加文字提示
  this.add.text(10, 10, 'Cyan circle bouncing at speed 200', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
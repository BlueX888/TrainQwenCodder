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
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  
  // 生成纹理
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，节省资源
  
  // 创建物理精灵
  const ball = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置初始速度（200速度，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  ball.setVelocity(velocity.x, velocity.y);
  
  // 设置碰撞世界边界
  ball.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ball.setBounce(1, 1);
  
  // 可选：添加文字提示
  this.add.text(10, 10, 'Cyan ball bouncing at 200 speed', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);
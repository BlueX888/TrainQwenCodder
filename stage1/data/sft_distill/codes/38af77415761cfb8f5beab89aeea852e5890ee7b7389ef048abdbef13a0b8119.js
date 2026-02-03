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
    create: create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(25, 25, 25); // 中心点(25,25)，半径25
  
  // 生成纹理
  graphics.generateTexture('whiteBall', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵
  const ball = this.physics.add.sprite(400, 300, 'whiteBall');
  
  // 设置初始速度（随机方向，速度300）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 300;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 300;
  ball.setVelocity(velocityX, velocityY);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ball.setBounce(1, 1);
  
  // 启用世界边界碰撞
  ball.setCollideWorldBounds(true);
}

new Phaser.Game(config);
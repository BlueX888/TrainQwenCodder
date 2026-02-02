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
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形，中心在(25, 25)
  
  // 生成纹理
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建物理精灵，位置在画布中心
  const ball = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置速度为 360（斜向移动，x和y方向各约254.6）
  const angle = Phaser.Math.DegToRad(45); // 45度角
  const velocityX = Math.cos(angle) * 360;
  const velocityY = Math.sin(angle) * 360;
  ball.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  ball.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ball.setBounce(1, 1);
}

new Phaser.Game(config);
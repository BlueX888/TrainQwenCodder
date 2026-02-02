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
  // 使用 Graphics 绘制红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25); // 在中心点绘制半径25的圆
  
  // 生成纹理
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'redCircle');
  
  // 设置初始速度（300像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 300;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 300;
  circle.setVelocity(velocityX, velocityY);
  
  // 设置与世界边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
}

// 启动游戏
new Phaser.Game(config);
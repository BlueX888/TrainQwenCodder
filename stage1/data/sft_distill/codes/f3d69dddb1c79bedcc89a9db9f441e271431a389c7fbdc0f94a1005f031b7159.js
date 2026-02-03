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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  
  // 生成纹理
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'purpleCircle');
  
  // 设置圆形碰撞体为圆形（更精确的碰撞检测）
  circle.setCircle(25);
  
  // 设置随机初始速度，速度大小为300
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 300;
  const velocityY = Math.sin(angle * Math.PI / 180) * 300;
  circle.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
}

new Phaser.Game(config);
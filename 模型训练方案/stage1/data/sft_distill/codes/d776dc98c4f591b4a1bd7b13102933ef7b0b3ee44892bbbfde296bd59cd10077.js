const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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
  // 使用 Graphics 绘制白色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(20, 20, 20); // 在(20,20)位置绘制半径20的圆
  
  // 生成纹理
  graphics.generateTexture('whiteCircle', 40, 40);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'whiteCircle');
  
  // 设置初始速度（随机方向，速度为300）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 300);
  circle.setVelocity(velocity.x, velocity.y);
  
  // 设置物理体属性
  circle.setCollideWorldBounds(true); // 与世界边界碰撞
  circle.setBounce(1, 1); // 完全弹性碰撞，反弹系数为1
  
  // 设置圆形碰撞体为圆形（更精确的碰撞检测）
  circle.body.setCircle(20);
  
  // 可选：添加文字提示
  this.add.text(10, 10, 'White circle bouncing at 300 speed', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
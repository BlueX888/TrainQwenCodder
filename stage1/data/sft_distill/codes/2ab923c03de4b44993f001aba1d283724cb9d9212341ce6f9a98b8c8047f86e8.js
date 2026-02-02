const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不需要重力
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
  // 使用 Graphics 创建红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25); // 半径 25 的圆形
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'redCircle');
  
  // 设置初始速度（随机方向，速度为 300）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 300;
  const velocityY = Math.sin(angle) * 300;
  circle.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  circle.setBounce(1, 1);
  
  // 添加提示文本
  this.add.text(10, 10, 'Red circle bouncing at 300 speed', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);
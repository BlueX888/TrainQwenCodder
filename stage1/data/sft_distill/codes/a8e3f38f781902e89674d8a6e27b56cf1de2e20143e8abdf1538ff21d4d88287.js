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
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置速度为 360（斜向移动，使用勾股定理分解为 x 和 y 方向）
  // 速度 360 可以分解为 x: 254.56, y: 254.56 (360/√2)
  const velocity = 360 / Math.sqrt(2);
  circle.setVelocity(velocity, velocity);
  
  // 设置边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  circle.setBounce(1, 1);
  
  // 可选：添加边界视觉提示
  const bounds = this.add.graphics();
  bounds.lineStyle(2, 0xffffff, 1);
  bounds.strokeRect(0, 0, 800, 600);
}

new Phaser.Game(config);
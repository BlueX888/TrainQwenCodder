const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力，保持匀速运动
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
  // 使用 Graphics 绘制蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建物理精灵，位置在画布中心
  const ball = this.physics.add.sprite(400, 300, 'blueCircle');

  // 设置初始速度（斜向移动，速度大小约为300）
  // 使用勾股定理：sqrt(x^2 + y^2) ≈ 300
  // 取 x=212, y=212，则 sqrt(212^2 + 212^2) ≈ 300
  ball.setVelocity(212, 212);

  // 启用世界边界碰撞
  ball.setCollideWorldBounds(true);

  // 设置反弹系数为1，实现完美反弹
  ball.setBounce(1, 1);
}

new Phaser.Game(config);
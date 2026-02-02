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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制一个等边三角形（中心在 32, 32）
  graphics.fillTriangle(
    32, 10,    // 顶点
    10, 54,    // 左下
    54, 54     // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  triangle.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：让三角形根据移动方向旋转
  this.physics.world.on('worldbounds', (body) => {
    if (body.gameObject === triangle) {
      // 根据速度方向更新旋转角度
      const angle = Math.atan2(body.velocity.y, body.velocity.x);
      triangle.setRotation(angle + Math.PI / 2);
    }
  });
  
  // 初始旋转
  const initialAngle = Math.atan2(velocity.y, velocity.x);
  triangle.setRotation(initialAngle + Math.PI / 2);
}

new Phaser.Game(config);
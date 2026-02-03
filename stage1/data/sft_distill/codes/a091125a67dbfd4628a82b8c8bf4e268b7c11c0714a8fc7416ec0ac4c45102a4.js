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
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制一个等边三角形（中心在 32, 32）
  graphics.fillTriangle(
    32, 10,    // 顶点
    10, 54,    // 左下角
    54, 54     // 右下角
  );
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangleTex', 64, 64);
  graphics.destroy(); // 销毁 Graphics 对象以释放资源
  
  // 创建物理精灵
  const triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置初始速度（随机方向，速度为 160）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 160);
  triangle.setVelocity(velocity.x, velocity.y);
  
  // 启用世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 可选：让三角形根据移动方向旋转
  this.physics.world.on('worldbounds', (body) => {
    if (body.gameObject === triangle) {
      // 根据速度方向更新旋转角度
      const angle = Math.atan2(body.velocity.y, body.velocity.x);
      triangle.setRotation(angle + Math.PI / 2); // +90度使三角形朝向运动方向
    }
  });
  
  // 初始旋转
  const initialAngle = Math.atan2(velocity.y, velocity.x);
  triangle.setRotation(initialAngle + Math.PI / 2);
}

new Phaser.Game(config);
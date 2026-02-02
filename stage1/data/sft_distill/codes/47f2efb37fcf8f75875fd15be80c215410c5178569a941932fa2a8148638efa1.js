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
    create: create,
    update: update
  }
};

let triangle;
const SPEED = 160;

function preload() {
  // 预加载阶段（无需加载外部资源）
}

function create() {
  // 使用Graphics绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向右上的三角形（中心在32,32）
  graphics.fillTriangle(
    32, 10,   // 顶点
    10, 54,   // 左下
    54, 54    // 右下
  );
  
  // 生成64x64的纹理
  graphics.generateTexture('triangleTex', 64, 64);
  graphics.destroy();
  
  // 创建带物理的三角形精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置物理属性
  triangle.body.setBounce(1, 1); // 完全弹性碰撞
  triangle.body.setCollideWorldBounds(true); // 与世界边界碰撞
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, SPEED);
  triangle.body.setVelocity(velocity.x, velocity.y);
}

function update(time, delta) {
  // 保持恒定速度（修正可能的速度衰减）
  const currentSpeed = Math.sqrt(
    triangle.body.velocity.x ** 2 + 
    triangle.body.velocity.y ** 2
  );
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - SPEED) > 1) {
    const scale = SPEED / currentSpeed;
    triangle.body.setVelocity(
      triangle.body.velocity.x * scale,
      triangle.body.velocity.y * scale
    );
  }
  
  // 根据移动方向旋转三角形（可选，增强视觉效果）
  triangle.rotation = Math.atan2(triangle.body.velocity.y, triangle.body.velocity.x) + Math.PI / 2;
}

new Phaser.Game(config);
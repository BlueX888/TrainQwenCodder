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
    create: create,
    update: update
  },
  backgroundColor: '#ffffff'
};

let triangle;
const SPEED = 160;

function preload() {
  // 预加载阶段（无需外部资源）
}

function create() {
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制一个等边三角形（中心在32,32）
  graphics.fillTriangle(
    32, 10,   // 顶点
    10, 54,   // 左下
    54, 54    // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTexture');
  
  // 设置世界边界碰撞
  triangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  triangle.setBounce(1, 1);
  
  // 设置初始速度（45度角方向，速度大小为160）
  const angle = Math.PI / 4; // 45度
  const vx = Math.cos(angle) * SPEED;
  const vy = Math.sin(angle) * SPEED;
  triangle.setVelocity(vx, vy);
}

function update(time, delta) {
  // 保持速度恒定为160
  const body = triangle.body;
  const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - SPEED) > 0.1) {
    // 归一化速度并乘以目标速度
    const scale = SPEED / currentSpeed;
    body.velocity.x *= scale;
    body.velocity.y *= scale;
  }
}

new Phaser.Game(config);
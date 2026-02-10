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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制三角形（等边三角形，边长约60）
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 顶点
  graphics.lineTo(0, 52);      // 左下
  graphics.lineTo(60, 52);     // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 60, 52);
  graphics.destroy();
  
  // 创建物理精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * SPEED;
  const velocityY = Math.sin(angle * Math.PI / 180) * SPEED;
  triangle.setVelocity(velocityX, velocityY);
  
  // 设置与世界边界碰撞
  triangle.setCollideWorldBounds(true);
  triangle.setBounce(1, 1); // 完全弹性碰撞
  
  // 确保物理体大小匹配纹理
  triangle.body.setSize(60, 52);
}

function update(time, delta) {
  // 保持恒定速度（修正因碰撞可能产生的速度变化）
  const currentVelocity = triangle.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度发生变化，归一化到目标速度
  if (Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    triangle.setVelocity(
      currentVelocity.x * scale,
      currentVelocity.y * scale
    );
  }
}

new Phaser.Game(config);
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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);    // 顶点
  graphics.lineTo(-26, 15);   // 左下角
  graphics.lineTo(26, 15);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 52, 45);
  graphics.destroy();
  
  // 创建物理精灵
  triangle = this.physics.add.sprite(400, 300, 'triangleTex');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const speed = 200;
  triangle.setVelocity(
    Math.cos(angle * Math.PI / 180) * speed,
    Math.sin(angle * Math.PI / 180) * speed
  );
  
  // 设置碰撞边界
  triangle.setCollideWorldBounds(true);
  triangle.setBounce(1, 1); // 完全弹性碰撞
}

function update(time, delta) {
  // 检查边界碰撞并反转速度
  const bounds = this.physics.world.bounds;
  
  // 左右边界
  if (triangle.x <= triangle.width / 2 || triangle.x >= bounds.width - triangle.width / 2) {
    triangle.setVelocityX(-triangle.body.velocity.x);
  }
  
  // 上下边界
  if (triangle.y <= triangle.height / 2 || triangle.y >= bounds.height - triangle.height / 2) {
    triangle.setVelocityY(-triangle.body.velocity.y);
  }
  
  // 保持速度恒定为200
  const currentSpeed = Math.sqrt(
    triangle.body.velocity.x ** 2 + triangle.body.velocity.y ** 2
  );
  
  if (currentSpeed !== 0 && Math.abs(currentSpeed - 200) > 1) {
    triangle.setVelocity(
      (triangle.body.velocity.x / currentSpeed) * 200,
      (triangle.body.velocity.y / currentSpeed) * 200
    );
  }
}

new Phaser.Game(config);
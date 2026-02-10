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
  }
};

let hexagon;
let velocity = { x: 160, y: 0 }; // 初始水平移动

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制六边形（中心点在原点）
  const hexRadius = 30;
  const hexPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPath.push({
      x: hexRadius + hexRadius * Math.cos(angle),
      y: hexRadius + hexRadius * Math.sin(angle)
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(hexPath[0].x, hexPath[0].y);
  for (let i = 1; i < hexPath.length; i++) {
    graphics.lineTo(hexPath[i].x, hexPath[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（速度大小为160，方向为右上45度）
  const speed = 160;
  const angle = Phaser.Math.DegToRad(45);
  hexagon.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置碰撞边界
  hexagon.setCollideWorldBounds(false); // 我们手动处理反弹
}

function update(time, delta) {
  // 获取六边形的边界
  const bounds = hexagon.getBounds();
  
  // 检测左右边界碰撞
  if (bounds.left <= 0 || bounds.right >= config.width) {
    hexagon.setVelocityX(-hexagon.body.velocity.x);
  }
  
  // 检测上下边界碰撞
  if (bounds.top <= 0 || bounds.bottom >= config.height) {
    hexagon.setVelocityY(-hexagon.body.velocity.y);
  }
  
  // 确保速度大小保持在160（防止浮点误差累积）
  const currentSpeed = Math.sqrt(
    hexagon.body.velocity.x ** 2 + 
    hexagon.body.velocity.y ** 2
  );
  
  if (Math.abs(currentSpeed - 160) > 1) {
    const scale = 160 / currentSpeed;
    hexagon.setVelocity(
      hexagon.body.velocity.x * scale,
      hexagon.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);
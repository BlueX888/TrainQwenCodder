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
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 绘制星形（中心点在 50, 50，半径 40）
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（160 速度，分解为 x 和 y 方向）
  // 使用 45 度角，速度分量为 160/√2 ≈ 113
  const speed = 160;
  const angle = Math.PI / 4; // 45度
  star.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置碰撞世界边界
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 添加旋转效果使运动更生动
  star.setAngularVelocity(100);
  
  // 显示速度信息（可选）
  const velocityText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });
  
  // 更新速度显示
  this.events.on('update', () => {
    const vx = Math.round(star.body.velocity.x);
    const vy = Math.round(star.body.velocity.y);
    const totalSpeed = Math.round(Math.sqrt(vx * vx + vy * vy));
    velocityText.setText(`Speed: ${totalSpeed} px/s\nVelocity: (${vx}, ${vy})`);
  });
}

new Phaser.Game(config);
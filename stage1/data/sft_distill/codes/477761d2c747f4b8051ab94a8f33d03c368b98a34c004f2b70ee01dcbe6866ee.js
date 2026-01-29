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
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制五角星
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  this.star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（240速度，斜向移动）
  const speed = 240;
  const angle = Math.PI / 4; // 45度角
  this.star.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 启用世界边界碰撞
  this.star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  this.star.setBounce(1, 1);
}

function update(time, delta) {
  // 游戏逻辑更新（此场景无需额外更新逻辑）
}

new Phaser.Game(config);
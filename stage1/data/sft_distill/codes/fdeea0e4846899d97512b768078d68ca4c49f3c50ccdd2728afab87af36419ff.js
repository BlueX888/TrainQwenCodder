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

let diamond;
let pointer;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制菱形（四个顶点）
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  diamond = this.physics.add.sprite(400, 300, 'diamond');
  diamond.setOrigin(0.5, 0.5);
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算菱形到鼠标的角度
  const angle = Phaser.Math.Angle.Between(
    diamond.x,
    diamond.y,
    mouseX,
    mouseY
  );
  
  // 计算菱形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    diamond.x,
    diamond.y,
    mouseX,
    mouseY
  );
  
  // 如果距离很小（接近鼠标），停止移动
  if (distance < 5) {
    diamond.setVelocity(0, 0);
  } else {
    // 使用速度240朝鼠标方向移动
    const velocityX = Math.cos(angle) * 240;
    const velocityY = Math.sin(angle) * 240;
    diamond.setVelocity(velocityX, velocityY);
  }
}

new Phaser.Game(config);
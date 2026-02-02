const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let star;
let pointer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制五角星
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 12;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
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
  
  // 创建星形精灵并启用物理
  star = this.physics.add.sprite(400, 300, 'star');
  star.setScale(1);
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 设置最大速度，防止过快
  star.body.setMaxSpeed(360);
}

function update(time, delta) {
  // 计算星形到鼠标的角度
  const angle = Phaser.Math.Angle.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于一个阈值才移动，避免抖动
  if (distance > 5) {
    // 设置朝向鼠标的速度（360像素/秒）
    this.physics.velocityFromRotation(
      angle,
      360,
      star.body.velocity
    );
  } else {
    // 距离很近时停止
    star.body.setVelocity(0, 0);
  }
}

new Phaser.Game(config);
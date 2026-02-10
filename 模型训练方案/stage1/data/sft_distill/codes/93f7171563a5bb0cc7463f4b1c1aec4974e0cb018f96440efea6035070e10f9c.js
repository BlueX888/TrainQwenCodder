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

let hexagon;
const FOLLOW_SPEED = 160;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制六边形
  const radius = 30;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = radius + Math.cos(angle * i) * radius;
    const y = radius + Math.sin(angle * i) * radius;
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建六边形精灵并启用物理
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置拖拽系数，使移动更平滑
  hexagon.setDamping(true);
  hexagon.setDrag(0.95);
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算六边形中心到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    hexagon.x,
    hexagon.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于一个小阈值，才移动（避免抖动）
  if (distance > 5) {
    // 计算从六边形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      hexagon.x,
      hexagon.y,
      pointer.x,
      pointer.y
    );
    
    // 根据角度和速度设置速度向量
    this.physics.velocityFromRotation(
      angle,
      FOLLOW_SPEED,
      hexagon.body.velocity
    );
  } else {
    // 距离很近时停止移动
    hexagon.setVelocity(0, 0);
  }
}

new Phaser.Game(config);
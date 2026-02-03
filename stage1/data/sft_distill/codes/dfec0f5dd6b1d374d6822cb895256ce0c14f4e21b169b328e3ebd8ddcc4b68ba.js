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
const FOLLOW_SPEED = 160;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius + 32,
      y: Math.sin(angle) * radius + 32
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵并启用物理系统
  star = this.physics.add.sprite(400, 300, 'star');
  star.setCollideWorldBounds(false);
  
  // 设置阻尼，使移动更平滑
  star.setDamping(true);
  star.setDrag(0.99);
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  
  // 计算星形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于一个很小的阈值，才移动（避免抖动）
  if (distance > 1) {
    // 计算从星形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      star.x,
      star.y,
      pointer.x,
      pointer.y
    );
    
    // 根据角度设置速度向量
    this.physics.velocityFromRotation(
      angle,
      FOLLOW_SPEED,
      star.body.velocity
    );
  } else {
    // 距离很近时停止移动
    star.body.setVelocity(0, 0);
  }
}

new Phaser.Game(config);
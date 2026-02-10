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

let star;
let pointer;
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
  const innerRadius = 12;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    points.push({
      x: outerRadius + Math.cos(angle) * radius,
      y: outerRadius + Math.sin(angle) * radius
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
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  star = this.physics.add.sprite(400, 300, 'star');
  star.setCollideWorldBounds(false);
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算星形到鼠标的角度
  const angle = Phaser.Math.Angle.Between(
    star.x,
    star.y,
    mouseX,
    mouseY
  );
  
  // 计算星形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    star.x,
    star.y,
    mouseX,
    mouseY
  );
  
  // 如果距离很近（小于5像素），停止移动避免抖动
  if (distance < 5) {
    star.setVelocity(0, 0);
  } else {
    // 根据角度设置速度
    const velocityX = Math.cos(angle) * FOLLOW_SPEED;
    const velocityY = Math.sin(angle) * FOLLOW_SPEED;
    star.setVelocity(velocityX, velocityY);
  }
}

new Phaser.Game(config);
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

let circle;
let pointer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9933ff, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy();

  // 创建带物理属性的圆形精灵，初始位置在屏幕中心
  circle = this.physics.add.sprite(400, 300, 'purpleCircle');
  
  // 设置最大速度，防止移动过快
  circle.setMaxVelocity(360, 360);
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算圆形中心到鼠标指针的角度
  const angle = Phaser.Math.Angle.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );
  
  // 计算圆形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于一个阈值（避免抖动），则移动
  if (distance > 5) {
    // 使用速度360朝向鼠标方向移动
    this.physics.velocityFromRotation(
      angle,
      360,
      circle.body.velocity
    );
  } else {
    // 距离很近时停止移动
    circle.setVelocity(0, 0);
  }
}

new Phaser.Game(config);
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

let rectangle;
let pointer;
const FOLLOW_SPEED = 360;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('yellowRect', 50, 50);
  graphics.destroy();

  // 创建带物理属性的矩形精灵，初始位置在屏幕中心
  rectangle = this.physics.add.sprite(400, 300, 'yellowRect');
  
  // 获取指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to make the yellow rectangle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标当前位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算矩形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    rectangle.x,
    rectangle.y,
    mouseX,
    mouseY
  );

  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 5) {
    // 计算矩形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      rectangle.x,
      rectangle.y,
      mouseX,
      mouseY
    );

    // 根据角度和速度设置速度向量
    this.physics.velocityFromRotation(
      angle,
      FOLLOW_SPEED,
      rectangle.body.velocity
    );
  } else {
    // 距离很近时停止移动
    rectangle.body.setVelocity(0, 0);
  }
}

new Phaser.Game(config);
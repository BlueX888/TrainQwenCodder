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
const FOLLOW_SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy();

  // 创建物理精灵，初始位置在屏幕中心
  circle = this.physics.add.sprite(400, 300, 'purpleCircle');
  circle.setCollideWorldBounds(false);

  // 获取鼠标指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to control the purple circle', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算圆形中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );

  // 只有当距离大于一个小阈值时才移动，避免抖动
  if (distance > 5) {
    // 计算从圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );

    // 根据角度和速度设置速度向量
    // delta 是毫秒，需要转换为秒
    const velocityX = Math.cos(angle) * FOLLOW_SPEED;
    const velocityY = Math.sin(angle) * FOLLOW_SPEED;

    circle.setVelocity(velocityX, velocityY);

    // 如果距离很近，直接设置位置避免超调
    if (distance < FOLLOW_SPEED * (delta / 1000)) {
      circle.setPosition(pointer.x, pointer.y);
      circle.setVelocity(0, 0);
    }
  } else {
    // 距离很近时停止移动
    circle.setVelocity(0, 0);
  }
}

new Phaser.Game(config);
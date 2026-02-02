const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let circle;
let pointer;
const FOLLOW_SPEED = 360; // 每秒移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径为25的圆
  graphics.generateTexture('circleTexture', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'circleTexture');

  // 获取指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the circle follow', {
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

  // 只有当距离大于1像素时才移动（避免抖动）
  if (distance > 1) {
    // 计算从圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );

    // 根据速度和时间增量计算本帧应该移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 使用 Math.min 确保不会超过目标位置
    const actualDistance = Math.min(moveDistance, distance);

    // 根据角度和距离计算新位置
    circle.x += Math.cos(angle) * actualDistance;
    circle.y += Math.sin(angle) * actualDistance;
  }
}

new Phaser.Game(config);
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
const FOLLOW_SPEED = 360; // 每秒移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'purpleCircle');
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  const targetX = pointer.x;
  const targetY = pointer.y;

  // 计算圆形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    targetX,
    targetY
  );

  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      targetX,
      targetY
    );

    // 计算本帧应该移动的距离（速度 * 时间）
    // delta 是毫秒，需要转换为秒
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      circle.x = targetX;
      circle.y = targetY;
    } else {
      // 根据角度和移动距离计算新位置
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
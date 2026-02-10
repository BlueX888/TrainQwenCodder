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
const FOLLOW_SPEED = 360; // 每秒移动360像素

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(25, 25, 25); // 半径25的圆
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'blueCircle');

  // 获取鼠标指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，蓝色圆形会跟随', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算圆形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    mouseX,
    mouseY
  );

  // 只有当距离大于1像素时才移动（避免抖动）
  if (distance > 1) {
    // 计算移动方向角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      mouseX,
      mouseY
    );

    // 计算本帧应该移动的距离（速度 * 时间）
    // delta 是毫秒，需要转换为秒
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果本帧移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      circle.x = mouseX;
      circle.y = mouseY;
    } else {
      // 根据角度和移动距离计算新位置
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circle;
let pointer;
const FOLLOW_SPEED = 360; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('circleTexture', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'circleTexture');

  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算圆形与鼠标指针之间的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );

  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算圆形指向鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );

    // 计算本帧应该移动的距离（速度 * 时间，delta单位是毫秒）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      circle.x = pointer.x;
      circle.y = pointer.y;
    } else {
      // 根据角度和移动距离更新位置
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
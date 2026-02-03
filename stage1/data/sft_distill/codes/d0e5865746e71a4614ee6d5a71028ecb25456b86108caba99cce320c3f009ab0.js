const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circle;
let pointer;
const FOLLOW_SPEED = 360; // 每秒移动360像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'blueCircle');

  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算圆形与鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    mouseX,
    mouseY
  );

  // 如果距离大于1像素，才进行移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      mouseX,
      mouseY
    );

    // 计算本帧应该移动的距离（速度 * 时间）
    // delta 是毫秒，需要转换为秒
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果本帧移动距离大于剩余距离，直接到达目标点
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
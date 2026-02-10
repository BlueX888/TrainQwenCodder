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
  // 使用 Graphics 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'orangeCircle');

  // 获取鼠标指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the circle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算圆形中心与鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    pointer.x,
    pointer.y
  );

  // 如果距离大于1像素，则移动圆形
  if (distance > 1) {
    // 计算从圆形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      pointer.x,
      pointer.y
    );

    // 计算本帧应该移动的距离（速度 * 时间）
    // delta 是毫秒，需要转换为秒
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果移动距离大于剩余距离，直接到达目标位置
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
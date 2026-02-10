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

let rectangle;
const FOLLOW_SPEED = 300;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建白色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteRect', 50, 50);
  graphics.destroy();

  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'whiteRect');
  rectangle.setOrigin(0.5, 0.5);
}

function update(time, delta) {
  // 获取当前鼠标指针位置
  const pointer = this.input.activePointer;
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算矩形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    rectangle.x,
    rectangle.y,
    mouseX,
    mouseY
  );

  // 如果距离大于1像素，则移动矩形
  if (distance > 1) {
    // 计算方向向量
    const directionX = mouseX - rectangle.x;
    const directionY = mouseY - rectangle.y;

    // 归一化方向向量
    const angle = Math.atan2(directionY, directionX);

    // 计算本帧移动的距离（速度 * 时间，delta单位为毫秒需转换为秒）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      rectangle.x = mouseX;
      rectangle.y = mouseY;
    } else {
      // 按速度平滑移动
      rectangle.x += Math.cos(angle) * moveDistance;
      rectangle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
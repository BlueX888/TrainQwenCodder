const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;
const FOLLOW_SPEED = 200; // 跟随速度（像素/秒）

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 40); // 绘制 60x40 的矩形
  graphics.generateTexture('yellowRect', 60, 40);
  graphics.destroy();

  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'yellowRect');
  rectangle.setOrigin(0.5, 0.5);

  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the yellow rectangle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取当前鼠标指针位置
  const pointer = this.input.activePointer;
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算矩形中心到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    rectangle.x,
    rectangle.y,
    mouseX,
    mouseY
  );

  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算从矩形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      rectangle.x,
      rectangle.y,
      mouseX,
      mouseY
    );

    // 计算本帧应移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果本帧移动距离大于实际距离，直接到达目标位置
    if (moveDistance >= distance) {
      rectangle.x = mouseX;
      rectangle.y = mouseY;
    } else {
      // 根据角度和移动距离计算新位置
      rectangle.x += Math.cos(angle) * moveDistance;
      rectangle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
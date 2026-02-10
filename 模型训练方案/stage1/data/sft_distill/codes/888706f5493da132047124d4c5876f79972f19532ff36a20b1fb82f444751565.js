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
let pointer;
const FOLLOW_SPEED = 360; // 每秒移动360像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 40); // 60x40的矩形
  graphics.generateTexture('yellowRect', 60, 40);
  graphics.destroy();

  // 创建矩形精灵，初始位置在屏幕中心
  rectangle = this.add.sprite(400, 300, 'yellowRect');
  rectangle.setOrigin(0.5, 0.5);

  // 获取指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，黄色矩形会平滑跟随', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算矩形到鼠标的距离
  const dx = mouseX - rectangle.x;
  const dy = mouseY - rectangle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算移动方向（单位向量）
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 根据速度和时间计算本帧应该移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果本帧移动距离大于实际距离，直接到达目标点
    if (moveDistance >= distance) {
      rectangle.x = mouseX;
      rectangle.y = mouseY;
    } else {
      // 否则按速度移动
      rectangle.x += dirX * moveDistance;
      rectangle.y += dirY * moveDistance;
    }
  }
}

new Phaser.Game(config);
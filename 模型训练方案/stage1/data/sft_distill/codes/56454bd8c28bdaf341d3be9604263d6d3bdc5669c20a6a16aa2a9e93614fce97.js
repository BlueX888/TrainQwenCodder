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

let square;
const FOLLOW_SPEED = 160; // 跟随速度（像素/秒）

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('squareTex', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在屏幕中心
  square = this.add.sprite(400, 300, 'squareTex');
  square.setOrigin(0.5, 0.5);
}

function update(time, delta) {
  // 获取当前活动的鼠标指针
  const pointer = this.input.activePointer;

  // 计算方块到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    square.x,
    square.y,
    pointer.x,
    pointer.y
  );

  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      square.x,
      square.y,
      pointer.x,
      pointer.y
    );

    // 根据速度和时间增量计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果本帧移动距离大于实际距离，直接到达目标位置
    if (moveDistance >= distance) {
      square.x = pointer.x;
      square.y = pointer.y;
    } else {
      // 根据角度和移动距离更新方块位置
      square.x += Math.cos(angle) * moveDistance;
      square.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
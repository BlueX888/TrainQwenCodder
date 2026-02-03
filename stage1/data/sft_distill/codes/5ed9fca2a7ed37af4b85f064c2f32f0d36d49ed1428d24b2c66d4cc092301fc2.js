const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let square;
let pointer;
const FOLLOW_SPEED = 300;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('whiteSquare', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在屏幕中心
  square = this.add.sprite(400, 300, 'whiteSquare');

  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算方块中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    square.x,
    square.y,
    pointer.x,
    pointer.y
  );

  // 只有当距离大于1像素时才移动（避免抖动）
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      square.x,
      square.y,
      pointer.x,
      pointer.y
    );

    // 根据速度和帧时间计算本帧移动距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果本帧移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      square.x = pointer.x;
      square.y = pointer.y;
    } else {
      // 否则按速度平滑移动
      square.x += Math.cos(angle) * moveDistance;
      square.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
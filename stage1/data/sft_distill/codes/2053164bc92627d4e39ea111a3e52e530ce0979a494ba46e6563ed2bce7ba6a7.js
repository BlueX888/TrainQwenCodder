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
let pointer;
const FOLLOW_SPEED = 360; // 每秒移动360像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('squareTex', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在屏幕中心
  square = this.add.sprite(400, 300, 'squareTex');

  // 获取鼠标指针
  pointer = this.input.activePointer;

  // 添加提示文字
  this.add.text(10, 10, '移动鼠标，方块会跟随', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算方块中心与鼠标位置的距离
  const distance = Phaser.Math.Distance.Between(
    square.x,
    square.y,
    pointer.x,
    pointer.y
  );

  // 只有当距离大于1像素时才移动（避免微小抖动）
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      square.x,
      square.y,
      pointer.x,
      pointer.y
    );

    // 根据速度和时间差计算本帧应该移动的距离
    // delta 是毫秒，需要转换为秒
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 限制移动距离不超过实际距离，避免超过目标点
    const actualMove = Math.min(moveDistance, distance);

    // 根据角度和移动距离计算新位置
    square.x += Math.cos(angle) * actualMove;
    square.y += Math.sin(angle) * actualMove;
  }
}

new Phaser.Game(config);
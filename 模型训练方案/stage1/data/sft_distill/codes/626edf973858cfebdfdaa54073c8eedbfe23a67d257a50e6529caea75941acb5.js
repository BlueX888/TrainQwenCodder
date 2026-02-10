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
const FOLLOW_SPEED = 160; // 跟随速度（像素/秒）

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建绿色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('squareTex', 50, 50);
  graphics.destroy();

  // 创建方块精灵，初始位置在屏幕中心
  square = this.add.sprite(400, 300, 'squareTex');
  square.setOrigin(0.5, 0.5);

  // 获取鼠标指针引用
  pointer = this.input.activePointer;

  // 添加提示文本
  const text = this.add.text(10, 10, '移动鼠标，绿色方块会跟随', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标当前位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算方块到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    square.x,
    square.y,
    mouseX,
    mouseY
  );

  // 如果距离大于1像素，则移动方块
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      square.x,
      square.y,
      mouseX,
      mouseY
    );

    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果移动距离大于剩余距离，直接到达目标位置
    if (moveDistance >= distance) {
      square.x = mouseX;
      square.y = mouseY;
    } else {
      // 根据角度和移动距离计算新位置
      square.x += Math.cos(angle) * moveDistance;
      square.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
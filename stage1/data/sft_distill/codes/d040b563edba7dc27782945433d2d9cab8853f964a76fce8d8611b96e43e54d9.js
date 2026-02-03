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

let yellowBox;
let pointer;
const followSpeed = 300; // 每秒移动300像素

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('yellowBox', 50, 50);
  graphics.destroy();

  // 创建黄色方块精灵，初始位置在屏幕中心
  yellowBox = this.add.sprite(400, 300, 'yellowBox');

  // 获取鼠标指针引用
  pointer = this.input.activePointer;

  // 添加提示文字
  this.add.text(10, 10, 'Move your mouse to see the yellow box follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算方块中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    yellowBox.x,
    yellowBox.y,
    pointer.x,
    pointer.y
  );

  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 5) {
    // 计算从方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      yellowBox.x,
      yellowBox.y,
      pointer.x,
      pointer.y
    );

    // 根据速度和时间差计算本帧应移动的距离
    // delta 是毫秒，需要转换为秒
    const moveDistance = followSpeed * (delta / 1000);

    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      yellowBox.x = pointer.x;
      yellowBox.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      yellowBox.x += Math.cos(angle) * moveDistance;
      yellowBox.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
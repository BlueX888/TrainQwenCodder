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

// 游戏状态变量
let objects = [];
let cursors;
let totalDistance = 0; // 可验证的状态信号：总移动距离
let statusText;

function preload() {
  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 半径25的圆
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建3个紫色对象，分布在不同位置
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];

  positions.forEach((pos, index) => {
    const obj = this.add.image(pos.x, pos.y, 'purpleCircle');
    obj.setData('id', index); // 设置ID便于识别
    objects.push(obj);
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();

  // 添加说明文本
  this.add.text(10, 550, '使用方向键控制3个紫色圆形同步移动', {
    fontSize: '16px',
    fill: '#cccccc'
  });
}

function update(time, delta) {
  // 计算移动速度（像素/秒转换为像素/帧）
  const speed = 300;
  const movement = (speed * delta) / 1000;

  let moved = false;
  let dx = 0;
  let dy = 0;

  // 检测方向键输入
  if (cursors.left.isDown) {
    dx = -movement;
    moved = true;
  } else if (cursors.right.isDown) {
    dx = movement;
    moved = true;
  }

  if (cursors.up.isDown) {
    dy = -movement;
    moved = true;
  } else if (cursors.down.isDown) {
    dy = movement;
    moved = true;
  }

  // 同步移动所有对象
  if (moved) {
    objects.forEach(obj => {
      // 计算新位置
      let newX = obj.x + dx;
      let newY = obj.y + dy;

      // 边界检测（考虑对象半径25）
      newX = Phaser.Math.Clamp(newX, 25, 800 - 25);
      newY = Phaser.Math.Clamp(newY, 25, 600 - 25);

      // 更新位置
      obj.x = newX;
      obj.y = newY;
    });

    // 更新总移动距离
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistance += distance;
    updateStatusText();
  }
}

function updateStatusText() {
  statusText.setText(
    `对象数量: ${objects.length} | 总移动距离: ${Math.floor(totalDistance)}px`
  );
}

new Phaser.Game(config);
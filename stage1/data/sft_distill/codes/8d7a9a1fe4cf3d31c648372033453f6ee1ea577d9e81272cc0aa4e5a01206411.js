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

// 全局状态变量（可验证信号）
let totalMoveDistance = 0;
let moveCount = 0;

// 存储3个紫色对象
let purpleObjects = [];

// 键盘控制
let cursors;

// 移动速度
const MOVE_SPEED = 300;

function preload() {
  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建3个紫色对象，分别放置在不同位置
  const positions = [
    { x: 200, y: 300 }, // 左边
    { x: 400, y: 300 }, // 中间
    { x: 600, y: 300 }  // 右边
  ];

  positions.forEach((pos, index) => {
    const obj = this.add.image(pos.x, pos.y, 'purpleCircle');
    obj.setData('index', index);
    obj.setData('startX', pos.x);
    obj.setData('startY', pos.y);
    purpleObjects.push(obj);
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加WASD作为备选控制
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText.call(this);

  // 显示控制提示
  this.add.text(10, 560, '使用方向键控制所有紫色圆形同步移动', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
}

function update(time, delta) {
  // 计算本帧的移动向量
  let velocityX = 0;
  let velocityY = 0;
  let isMoving = false;

  // 检测方向键状态
  if (cursors.left.isDown) {
    velocityX = -1;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = 1;
    isMoving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -1;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = 1;
    isMoving = true;
  }

  // 如果有移动输入，同步移动所有对象
  if (isMoving) {
    // 归一化对角线移动速度
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (length > 0) {
      velocityX /= length;
      velocityY /= length;
    }

    // 计算实际移动距离（像素/秒 * 秒）
    const moveX = velocityX * MOVE_SPEED * (delta / 1000);
    const moveY = velocityY * MOVE_SPEED * (delta / 1000);

    // 同步移动所有对象
    purpleObjects.forEach(obj => {
      let newX = obj.x + moveX;
      let newY = obj.y + moveY;

      // 边界检测（考虑对象半径25）
      newX = Phaser.Math.Clamp(newX, 25, 800 - 25);
      newY = Phaser.Math.Clamp(newY, 25, 600 - 25);

      obj.setPosition(newX, newY);
    });

    // 更新状态变量
    const frameMoveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
    totalMoveDistance += frameMoveDistance;
    moveCount++;

    // 每30帧更新一次显示（减少性能开销）
    if (moveCount % 30 === 0) {
      updateStatusText.call(this);
    }
  }
}

function updateStatusText() {
  this.statusText.setText([
    `总移动距离: ${Math.floor(totalMoveDistance)} px`,
    `移动帧数: ${moveCount}`,
    `对象数量: ${purpleObjects.length}`,
    `移动速度: ${MOVE_SPEED} px/s`
  ]);
}

new Phaser.Game(config);
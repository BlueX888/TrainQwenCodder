const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量（可验证信号）
let moveCount = 0;
let objects = [];
let cursors;
let statusText;

const OBJECT_COUNT = 20;
const MOVE_SPEED = 300;
const OBJECT_SIZE = 20;

function preload() {
  // 创建粉色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(OBJECT_SIZE / 2, OBJECT_SIZE / 2, OBJECT_SIZE / 2);
  graphics.generateTexture('pinkCircle', OBJECT_SIZE, OBJECT_SIZE);
  graphics.destroy();
}

function create() {
  // 创建20个粉色对象
  objects = [];
  for (let i = 0; i < OBJECT_COUNT; i++) {
    // 随机位置，确保不超出边界
    const x = Phaser.Math.Between(OBJECT_SIZE, 800 - OBJECT_SIZE);
    const y = Phaser.Math.Between(OBJECT_SIZE, 600 - OBJECT_SIZE);
    
    const obj = this.add.image(x, y, 'pinkCircle');
    obj.setData('id', i); // 设置ID用于调试
    objects.push(obj);
  }

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();

  // 添加说明文本
  this.add.text(10, 550, '使用方向键控制所有粉色圆形同步移动', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
}

function update(time, delta) {
  let moved = false;
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -MOVE_SPEED;
    moved = true;
  } else if (cursors.right.isDown) {
    velocityX = MOVE_SPEED;
    moved = true;
  }

  if (cursors.up.isDown) {
    velocityY = -MOVE_SPEED;
    moved = true;
  } else if (cursors.down.isDown) {
    velocityY = MOVE_SPEED;
    moved = true;
  }

  // 同步移动所有对象
  if (moved) {
    const deltaSeconds = delta / 1000;
    const deltaX = velocityX * deltaSeconds;
    const deltaY = velocityY * deltaSeconds;

    objects.forEach(obj => {
      // 计算新位置
      let newX = obj.x + deltaX;
      let newY = obj.y + deltaY;

      // 边界检测
      newX = Phaser.Math.Clamp(newX, OBJECT_SIZE / 2, 800 - OBJECT_SIZE / 2);
      newY = Phaser.Math.Clamp(newY, OBJECT_SIZE / 2, 600 - OBJECT_SIZE / 2);

      // 更新位置
      obj.setPosition(newX, newY);
    });

    // 更新移动计数（每帧只计数一次）
    if (delta > 0) {
      moveCount++;
      updateStatusText();
    }
  }
}

function updateStatusText() {
  statusText.setText([
    `对象数量: ${OBJECT_COUNT}`,
    `移动速度: ${MOVE_SPEED}`,
    `移动帧数: ${moveCount}`,
    `总移动距离: ${Math.floor(moveCount * MOVE_SPEED / 60)} 像素`
  ]);
}

new Phaser.Game(config);
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

// 状态信号变量
let totalMovementDistance = 0;
let moveCount = 0;
let objects = [];
let cursors;
const SPEED = 120;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建3个红色方块对象
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];

  positions.forEach((pos, index) => {
    // 使用Graphics绘制红色方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 50, 50);
    
    // 生成纹理
    graphics.generateTexture(`redBox${index}`, 50, 50);
    graphics.destroy();
    
    // 创建精灵对象
    const obj = this.add.sprite(pos.x, pos.y, `redBox${index}`);
    obj.setOrigin(0.5, 0.5);
    
    // 存储初始位置用于验证
    obj.initialX = pos.x;
    obj.initialY = pos.y;
    
    objects.push(obj);
  });

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText.call(this);

  // 添加提示文本
  this.add.text(400, 550, '使用方向键控制所有红色方块移动', {
    fontSize: '18px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  let velocityX = 0;
  let velocityY = 0;
  let isMoving = false;

  // 检测方向键状态
  if (cursors.left.isDown) {
    velocityX = -SPEED;
    isMoving = true;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
    isMoving = true;
  }

  if (cursors.up.isDown) {
    velocityY = -SPEED;
    isMoving = true;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
    isMoving = true;
  }

  // 同步移动所有对象
  if (isMoving) {
    const deltaSeconds = delta / 1000;
    const moveX = velocityX * deltaSeconds;
    const moveY = velocityY * deltaSeconds;
    
    objects.forEach(obj => {
      obj.x += moveX;
      obj.y += moveY;

      // 边界检测
      obj.x = Phaser.Math.Clamp(obj.x, 25, 775);
      obj.y = Phaser.Math.Clamp(obj.y, 25, 575);
    });

    // 更新状态信号
    const distance = Math.sqrt(moveX * moveX + moveY * moveY);
    totalMovementDistance += distance;
    moveCount++;

    // 每30帧更新一次显示
    if (moveCount % 30 === 0) {
      updateStatusText.call(this);
    }
  }
}

function updateStatusText() {
  const obj1 = objects[0];
  const obj2 = objects[1];
  const obj3 = objects[2];
  
  this.statusText.setText([
    `移动次数: ${moveCount}`,
    `总移动距离: ${Math.floor(totalMovementDistance)}px`,
    `对象1位置: (${Math.floor(obj1.x)}, ${Math.floor(obj1.y)})`,
    `对象2位置: (${Math.floor(obj2.x)}, ${Math.floor(obj2.y)})`,
    `对象3位置: (${Math.floor(obj3.x)}, ${Math.floor(obj3.y)})`
  ]);
}

new Phaser.Game(config);